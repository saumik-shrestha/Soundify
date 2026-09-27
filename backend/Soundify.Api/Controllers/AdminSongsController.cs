using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Soundify.Api.Data;
using Soundify.Api.Models;

namespace Soundify.Api.Controllers;

[ApiController]
[Route("api/admin/songs")]
[Authorize(Roles = "Admin")]
public class AdminSongsController : ControllerBase
{
    private readonly SoundifyDbContext _db;
    private readonly IWebHostEnvironment _environment;

    public AdminSongsController(
        SoundifyDbContext db,
        IWebHostEnvironment environment)
    {
        _db = db;
        _environment = environment;
    }

    // ============================================================
    // ADD SONG
    // POST: /api/admin/songs
    // ============================================================

    [HttpPost]
    [RequestSizeLimit(100_000_000)]
    public async Task<IActionResult> AddSong(
        [FromForm] AddSongRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Song title is required."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Artist))
        {
            return BadRequest(new
            {
                message = "Artist is required."
            });
        }

        if (request.Audio == null ||
            request.Audio.Length == 0)
        {
            return BadRequest(new
            {
                message = "Audio file is required."
            });
        }

        if (request.DurationSeconds < 0)
        {
            return BadRequest(new
            {
                message = "Duration cannot be negative."
            });
        }

        var webRootPath = GetWebRootPath();

        var uploadsRoot = Path.Combine(
            webRootPath,
            "uploads");

        var audioFolder = Path.Combine(
            uploadsRoot,
            "audio");

        var imageFolder = Path.Combine(
            uploadsRoot,
            "images");

        Directory.CreateDirectory(audioFolder);
        Directory.CreateDirectory(imageFolder);


        // ========================================================
        // VALIDATE AUDIO
        // ========================================================

        var audioExtension =
            Path.GetExtension(
                request.Audio.FileName)
                .ToLowerInvariant();

        var allowedAudioExtensions = new[]
        {
            ".mp3",
            ".wav",
            ".m4a",
            ".ogg"
        };

        if (!allowedAudioExtensions.Contains(
                audioExtension))
        {
            return BadRequest(new
            {
                message =
                    "Unsupported audio format. Please use MP3, WAV, M4A or OGG."
            });
        }


        // ========================================================
        // SAVE AUDIO
        // ========================================================

        var audioFileName =
            $"{Guid.NewGuid()}{audioExtension}";

        var audioPath = Path.Combine(
            audioFolder,
            audioFileName);

        try
        {
            await using var audioStream =
                new FileStream(
                    audioPath,
                    FileMode.Create);

            await request.Audio.CopyToAsync(
                audioStream);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message =
                    "Unable to save audio file.",

                error = ex.Message
            });
        }


        // ========================================================
        // SAVE IMAGE
        // ========================================================

        string? imageUrl = null;

        if (request.Image != null &&
            request.Image.Length > 0)
        {
            var imageExtension =
                Path.GetExtension(
                    request.Image.FileName)
                    .ToLowerInvariant();

            var allowedImageExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

            if (!allowedImageExtensions.Contains(
                    imageExtension))
            {
                DeleteFileIfExists(audioPath);

                return BadRequest(new
                {
                    message =
                        "Unsupported image format. Please use JPG, JPEG, PNG or WEBP."
                });
            }

            var imageFileName =
                $"{Guid.NewGuid()}{imageExtension}";

            var imagePath = Path.Combine(
                imageFolder,
                imageFileName);

            try
            {
                await using var imageStream =
                    new FileStream(
                        imagePath,
                        FileMode.Create);

                await request.Image.CopyToAsync(
                    imageStream);
            }
            catch (Exception ex)
            {
                DeleteFileIfExists(audioPath);

                return StatusCode(500, new
                {
                    message =
                        "Unable to save image file.",

                    error = ex.Message
                });
            }

            imageUrl =
                $"/uploads/images/{imageFileName}";
        }


        // ========================================================
        // CREATE DATABASE RECORD
        // ========================================================

        var song = new Song
        {
            Id = Guid.NewGuid(),

            Title =
                request.Title.Trim(),

            Artist =
                request.Artist.Trim(),

            Album =
                string.IsNullOrWhiteSpace(
                    request.Album)
                    ? null
                    : request.Album.Trim(),

            ImageUrl =
                imageUrl ?? string.Empty,

            AudioUrl =
                $"/uploads/audio/{audioFileName}",

            DurationSeconds =
                request.DurationSeconds,

            CreatedAt =
                DateTime.UtcNow
        };

        try
        {
            _db.Songs.Add(song);

            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            DeleteFileIfExists(audioPath);

            if (!string.IsNullOrWhiteSpace(
                    imageUrl))
            {
                var imageFileName =
                    Path.GetFileName(
                        imageUrl);

                var imagePath =
                    Path.Combine(
                        imageFolder,
                        imageFileName);

                DeleteFileIfExists(
                    imagePath);
            }

            return StatusCode(500, new
            {
                message =
                    "Unable to save song to database.",

                error = ex.Message
            });
        }

        return Ok(new
        {
            message =
                "Song uploaded successfully.",

            song = new
            {
                song.Id,
                song.Title,
                song.Artist,
                song.Album,
                song.ImageUrl,
                song.AudioUrl,
                song.DurationSeconds
            }
        });
    }


    // ============================================================
    // GET ALL SONGS
    // GET: /api/admin/songs
    // ============================================================

    [HttpGet]
    public async Task<IActionResult> GetSongs()
    {
        var songs = await _db.Songs
            .OrderByDescending(
                song => song.CreatedAt)
            .Select(song => new
            {
                song.Id,
                song.Title,
                song.Artist,
                song.Album,
                song.ImageUrl,
                song.AudioUrl,
                song.DurationSeconds,
                song.CreatedAt
            })
            .ToListAsync();

        return Ok(songs);
    }


    // ============================================================
    // UPDATE SONG
    // PUT: /api/admin/songs/{id}
    // ============================================================

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateSong(
        Guid id,
        [FromBody] UpdateSongRequest request)
    {
        if (string.IsNullOrWhiteSpace(
                request.Title))
        {
            return BadRequest(new
            {
                message =
                    "Song title is required."
            });
        }

        if (string.IsNullOrWhiteSpace(
                request.Artist))
        {
            return BadRequest(new
            {
                message =
                    "Artist is required."
            });
        }

        if (request.DurationSeconds < 0)
        {
            return BadRequest(new
            {
                message =
                    "Duration cannot be negative."
            });
        }

        var song = await _db.Songs
            .FirstOrDefaultAsync(
                x => x.Id == id);

        if (song == null)
        {
            return NotFound(new
            {
                message =
                    "Song not found."
            });
        }

        song.Title =
            request.Title.Trim();

        song.Artist =
            request.Artist.Trim();

        song.Album =
            string.IsNullOrWhiteSpace(
                request.Album)
                ? null
                : request.Album.Trim();

        song.DurationSeconds =
            request.DurationSeconds;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Song updated successfully.",

            song = new
            {
                song.Id,
                song.Title,
                song.Artist,
                song.Album,
                song.ImageUrl,
                song.AudioUrl,
                song.DurationSeconds,
                song.CreatedAt
            }
        });
    }


    // ============================================================
    // DELETE SONG
    // DELETE: /api/admin/songs/{id}
    // ============================================================

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSong(
        Guid id)
    {
        var song = await _db.Songs
            .FirstOrDefaultAsync(
                x => x.Id == id);

        if (song == null)
        {
            return NotFound(new
            {
                message =
                    "Song not found."
            });
        }

        var audioUrl =
            song.AudioUrl;

        var imageUrl =
            song.ImageUrl;

        _db.Songs.Remove(song);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message =
                    "Unable to delete song from database.",

                error = ex.Message
            });
        }

        DeleteUploadedFile(
            audioUrl,
            "audio");

        DeleteUploadedFile(
            imageUrl,
            "images");

        return Ok(new
        {
            message =
                "Song deleted successfully."
        });
    }


    // ============================================================
    // HELPER: WEB ROOT
    // ============================================================

    private string GetWebRootPath()
    {
        var webRootPath =
            _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(
                webRootPath))
        {
            webRootPath =
                Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot");
        }

        return webRootPath;
    }


    // ============================================================
    // HELPER: DELETE FILE
    // ============================================================

    private void DeleteFileIfExists(
        string filePath)
    {
        try
        {
            if (System.IO.File.Exists(
                    filePath))
            {
                System.IO.File.Delete(
                    filePath);
            }
        }
        catch
        {
            // Do not crash the API if
            // physical file deletion fails.
        }
    }


    // ============================================================
    // HELPER: DELETE ONLY BACKEND UPLOADS
    // ============================================================

    private void DeleteUploadedFile(
        string? url,
        string folder)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return;
        }

        var expectedPrefix =
            $"/uploads/{folder}/";

        if (!url.StartsWith(
                expectedPrefix,
                StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var fileName =
            Path.GetFileName(url);

        if (string.IsNullOrWhiteSpace(
                fileName))
        {
            return;
        }

        var folderPath =
            Path.Combine(
                GetWebRootPath(),
                "uploads",
                folder);

        var filePath =
            Path.Combine(
                folderPath,
                fileName);

        DeleteFileIfExists(
            filePath);
    }
}


// ================================================================
// ADD SONG REQUEST
// ================================================================

public class AddSongRequest
{
    public string Title { get; set; } = string.Empty;

    public string Artist { get; set; } = string.Empty;

    public string? Album { get; set; }

    public IFormFile? Audio { get; set; }

    public IFormFile? Image { get; set; }

    public int DurationSeconds { get; set; }
}


// ================================================================
// UPDATE SONG REQUEST
// ================================================================

public class UpdateSongRequest
{
    public string Title { get; set; } = string.Empty;

    public string Artist { get; set; } = string.Empty;

    public string? Album { get; set; }

    public int DurationSeconds { get; set; }
}