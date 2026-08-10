import os
import json
import base64
import subprocess
import boto3
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION")
)

VIDEO_EXTENSIONS = (".mp4", ".mov", ".avi", ".mkv", ".webm")


def list_recent_videos(hours=24):
    """List all video keys uploaded to the bucket in the last `hours` hours."""
    print(f"\nListing videos uploaded in the last {hours}h...")
    bucket = os.getenv("BUCKET_NAME")
    prefix = os.getenv("VIDEO_PREFIX", "") 

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    recent_keys = []

    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            if not key.lower().endswith(VIDEO_EXTENSIONS):
                continue
            if obj["LastModified"] >= cutoff:
                recent_keys.append(key)

    print(f"---> Found {len(recent_keys)} recent video(s)")
    return recent_keys


def download_video(key):
    """Download a single video by key to temp/."""
    print(f"\nDownloading {key}...")
    bucket = os.getenv("BUCKET_NAME")
    filename = os.path.basename(key)
    local_path = os.path.join("temp", filename)
    os.makedirs("temp", exist_ok=True)
    s3.download_file(bucket, key, local_path)
    print("---> Video Downloaded")
    return local_path


def get_video_duration(video_path):
    print("\nGetting Video Duration...")
    command = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_path
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    duration = float(result.stdout.strip())
    print(f"---> Duration: {duration:.2f}s")
    return duration


def extract_frames(video_path, frame_count=5):
    print(f"\nExtracting {frame_count} Frames...")
    duration = get_video_duration(video_path)
    interval = duration / (frame_count + 1)
    frame_paths = []
    base = os.path.splitext(os.path.basename(video_path))[0]
    for i in range(1, frame_count + 1):
        timestamp = interval * i
        output = f"temp/{base}_frame{i}.jpg"
        command = [
            "ffmpeg", "-y", "-ss", str(timestamp),
            "-i", video_path, "-frames:v", "1", output
        ]
        subprocess.run(command, check=True)
        print(f"---> Frame {i} extracted at {timestamp:.2f}s")
        frame_paths.append(output)
    print("---> All Frames Extracted")
    return frame_paths


def analyze_frames(frame_paths):
    print("\nAnalyzing Frames with Gemini...")
    parts = []
    prompt = f"""
You are an AI content moderator.
Below are {len(frame_paths)} frames extracted at evenly spaced intervals from a video.
Analyze ALL frames together and determine whether the video contains educational content.
Examples:
- Coding tutorial
- Teacher
- Whiteboard
- Classroom
- Online lecture
- Presentation
Reply ONLY in JSON.
{{
  "educational": true,
  "confidence": 95,
  "reason": "brief explanation"
}}
OR
{{
  "educational": false,
  "confidence": 90,
  "reason": "brief explanation"
}}
"""
    parts.append(prompt)
    for index, frame in enumerate(frame_paths):
        with open(frame, "rb") as f:
            image_data = f.read()
        parts.append(f"Frame {index+1}:")
        parts.append(
            genai.types.Part.from_bytes(data=image_data, mime_type="image/jpeg")
        )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=parts
    )
    text = response.text.strip()
    print("\nGemini Raw Response:")
    print(text)
    text = text.replace("```json", "").replace("```", "").strip()
    result = json.loads(text)
    print("\n---------------------")
    print("AI RESULT")
    print("-----------------------")
    print("Educational :", result["educational"])
    print("Confidence  :", result["confidence"])
    print("Reason      :", result["reason"])
    print("------------------------\n")
    return result


def process_video(key):
    """Run the full moderation pipeline for one video key. Returns a dict result."""
    try:
        video_path = download_video(key)
        frames = extract_frames(video_path, 5)
        result = analyze_frames(frames)
        result["key"] = key
        result["status"] = "success"
        if result["educational"]:
            print(f"---> {key} Accepted")
        else:
            print(f"---> {key} Rejected")
        return result
    except Exception as e:
        print(f"\nERROR processing {key}:")
        print(e)
        return {"key": key, "status": "error", "error": str(e)}


def main():
    print("--------------------- AI Video Moderation (last 24h) ---------------------")
    keys = list_recent_videos(hours=24)

    if not keys:
        print("No videos uploaded in the last 24 hours.")
        return

    results = []
    for key in keys:
        results.append(process_video(key))

    print("\n--------------------- SUMMARY ---------------------")
    for r in results:
        if r["status"] == "success":
            verdict = "ACCEPTED" if r["educational"] else "REJECTED"
            print(f"{r['key']}: {verdict} (confidence {r['confidence']})")
        else:
            print(f"{r['key']}: ERROR - {r['error']}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("\nERROR:")
        print(e)
