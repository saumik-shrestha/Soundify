using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Soundify.Api.Data;

namespace Soundify.Api.Controllers;

[ApiController]
[Route("api/likes")]
[Authorize]
public class LikesController : ControllerBase
{
    private readonly SoundifyDbContext _db;

    public LikesController(SoundifyDbContext db)
    {
        _db = db;
    }

    // GET: /api/likes
    // Returns all songs liked by the logged-in user.
    [HttpGet]
    public async Task<IActionResult> GetLikedSongs()
    {
        var userId = GetCurrentUserId();

        var songs = await _db.Likes
            .Where(like => like.UserId == userId)
            .Include(like => like.Song)
            .OrderByDescending(like => like.SongId)
            .Select(like => like.Song)
            .ToListAsync();

        return Ok(songs);
    }

    // GET: /api/likes/{songId}
    // Checks whether the logged-in user liked a song.
    [HttpGet("{songId:guid}")]
    public async Task<IActionResult> IsLiked(Guid songId)
    {
        var userId = GetCurrentUserId();

        var liked = await _db.Likes.AnyAsync(
            like =>
                like.UserId == userId &&
                like.SongId == songId
        );

        return Ok(new
        {
            liked
        });
    }

    // POST: /api/likes/{songId}
    // Likes a song.
    [HttpPost("{songId:guid}")]
    public async Task<IActionResult> LikeSong(Guid songId)
    {
        var userId = GetCurrentUserId();

        var songExists = await _db.Songs
            .AnyAsync(song => song.Id == songId);

        if (!songExists)
        {
            return NotFound(new
            {
                message = "Song not found."
            });
        }

        var existingLike = await _db.Likes
            .FirstOrDefaultAsync(
                like =>
                    like.UserId == userId &&
                    like.SongId == songId
            );

        if (existingLike != null)
        {
            return Ok(new
            {
                message = "Song is already liked.",
                liked = true
            });
        }

        _db.Likes.Add(new Models.Like
        {
            UserId = userId,
            SongId = songId
        });

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Song liked successfully.",
            liked = true
        });
    }

    // DELETE: /api/likes/{songId}
    // Removes a like from a song.
    [HttpDelete("{songId:guid}")]
    public async Task<IActionResult> UnlikeSong(Guid songId)
    {
        var userId = GetCurrentUserId();

        var like = await _db.Likes
            .FirstOrDefaultAsync(
                item =>
                    item.UserId == userId &&
                    item.SongId == songId
            );

        if (like == null)
        {
            return NotFound(new
            {
                message = "Song is not liked."
            });
        }

        _db.Likes.Remove(like);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Song unliked successfully.",
            liked = false
        });
    }

    private Guid GetCurrentUserId()
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
}