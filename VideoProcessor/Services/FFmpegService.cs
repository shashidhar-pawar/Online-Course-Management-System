using System.Diagnostics;

namespace VideoProcessor.Services
{
    public class FFmpegService
    {
        private readonly string _ffmpegPath;


    public FFmpegService(IConfiguration configuration)
        {
            _ffmpegPath = configuration["FFmpeg:Path"]
                ?? throw new InvalidOperationException(
                    "FFmpeg path is not configured.");
        }

        public async Task<string> ProcessVideoAsync(
            string inputPath,
            string outputPath)
        {
            var arguments =
                $"-i \"{inputPath}\" " +
                $"-c copy " +
                $"-movflags +faststart " +
                $"\"{outputPath}\"";

            var startInfo = new ProcessStartInfo
            {
                FileName = _ffmpegPath,
                Arguments = arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process
            {
                StartInfo = startInfo
            };

            process.Start();

            string output = await process.StandardOutput.ReadToEndAsync();
            string error = await process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new Exception(
                    $"FFmpeg processing failed: {error}");
            }

            return outputPath;
        }
    }


}
