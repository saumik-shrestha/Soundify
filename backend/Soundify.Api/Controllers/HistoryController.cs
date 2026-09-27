using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Soundify.Api.Data;
using Soundify.Api.Models;

namespace Soundify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HistoryController : ControllerBase
{
    private readonly SoundifyDbContext _db;

    public HistoryController(SoundifyDbContext db)
    {
        _db = db;
    }

    private Guid GetUserId()
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException();
        }

        return Guid.Parse(userId);
    }

    // GET: /api/history
    [HttpGet]
    public async Task<IActionResult> GetHistory()
    {
        var userId = GetUserId();

        // Get the user's history ordered by most recently played.
        var historyRows = await _db.ListeningHistory
            .Where(x => x.UserId == userId)
            .Include(x => x.Song)
            .OrderByDescending(x => x.PlayedAt)
            .Take(100)
            .ToListAsync();

        // Keep only the most recent play of each song.
        var uniqueHistory = historyRows
            .GroupBy(x => x.SongId)
            .Select(group => group.First())
            .OrderByDescending(x => x.PlayedAt)
            .Take(20)
            .Select(x => new
            {
                x.Id,
                x.PlayedAt,

                Song = new
                {
                    x.Song.Id,
                    x.Song.Title,
                    x.Song.Artist,
                    x.Song.Album,
                    x.Song.ImageUrl,
                    x.Song.AudioUrl,
                    x.Song.DurationSeconds
                }
            })
            .ToList();

        return Ok(uniqueHistory);
    }

    // POST: /api/history/{songId}
    [HttpPost("{songId:guid}")]
    public async Task<IActionResult> AddToHistory(Guid songId)
    {
        var userId = GetUserId();

        // Make sure the song exists.
        var songExists = await _db.Songs
            .AnyAsync(x => x.Id == songId);

        if (!songExists)
        {
            return NotFound(new
            {
                message = "Song not found."
            });
        }

        // Check whether this user already has this song
        // in recently played.
        var existingHistory = await _db.ListeningHistory
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.SongId == songId
            );

        if (existingHistory != null)
        {
            // Move the existing song to the top.
            existingHistory.PlayedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Recently played updated."
            });
        }

        // Create a new history entry.
        var history = new ListeningHistory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SongId = songId,
            PlayedAt = DateTime.UtcNow
        };

        _db.ListeningHistory.Add(history);

        await _db.SaveChangesAsync();

        // Keep only the latest 20 history records
        // for this user.
        var oldHistory = await _db.ListeningHistory
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.PlayedAt)
            .Skip(20)
            .ToListAsync();

        if (oldHistory.Count > 0)
        {
            _db.ListeningHistory.RemoveRange(oldHistory);

            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Song added to recently played."
        });
    }

    // DELETE: /api/history
    [HttpDelete]
    public async Task<IActionResult> ClearHistory()
    {
        var userId = GetUserId();

        var history = await _db.ListeningHistory
            .Where(x => x.UserId == userId)
            .ToListAsync();

        if (history.Count > 0)
        {
            _db.ListeningHistory.RemoveRange(history);

            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Recently played cleared."
        });
    }
}