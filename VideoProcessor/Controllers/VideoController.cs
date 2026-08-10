using Microsoft.AspNetCore.Mvc;
using VideoProcessor.Services;

namespace VideoProcessor.Controllers
{
    public class VideoController : Controller
    {
        private readonly IWebHostEnvironment _environment;  
        private readonly FFmpegService _ffmpegService;

    public VideoController(
        IWebHostEnvironment environment,
        FFmpegService ffmpegService)
        {
            _environment = environment;
            _ffmpegService = ffmpegService;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile video)
        {
            if (video == null || video.Length == 0)
            {
                return BadRequest("Please select a video.");
            }

            if (!video.ContentType.Equals(
                    "video/mp4",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Only MP4 videos are allowed.");
            }

            const long maxFileSize = 500 * 1024 * 1024;

            if (video.Length > maxFileSize)
            {
                return BadRequest(
                    "Video size cannot exceed 500 MB.");
            }

            string uploadsFolder = Path.Combine(
                _environment.WebRootPath,
                "uploads");

            string processedFolder = Path.Combine(
                _environment.WebRootPath,
                "processed");

            Directory.CreateDirectory(uploadsFolder);
            Directory.CreateDirectory(processedFolder);

            string inputFileName =
                $"{Guid.NewGuid()}.mp4";

            string outputFileName =
                $"{Path.GetFileNameWithoutExtension(inputFileName)}_processed.mp4";

            string inputPath = Path.Combine(
                uploadsFolder,
                inputFileName);

            string outputPath = Path.Combine(
                processedFolder,
                outputFileName);

            await using (var stream = new FileStream(
                inputPath,
                FileMode.Create))
            {
                await video.CopyToAsync(stream);
            }

            try
            {
                await _ffmpegService.ProcessVideoAsync(
                    inputPath,
                    outputPath);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    $"Video processing failed: {ex.Message}");
            }

            ViewBag.FileName = outputFileName;

            return View("Result");
        }

        [HttpGet]
        public IActionResult Download(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
            {
                return BadRequest();
            }

            string processedFolder = Path.Combine(
                _environment.WebRootPath,
                "processed");

            string safeFileName =
                Path.GetFileName(fileName);

            string filePath = Path.Combine(
                processedFolder,
                safeFileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Processed video not found.");
            }

            return PhysicalFile(
                filePath,
                "video/mp4",
                safeFileName);
        }
    }


}
