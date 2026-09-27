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
public class PlaylistsController : ControllerBase
{
    private readonly SoundifyDbContext _db;

    public PlaylistsController(SoundifyDbContext db)
    {
        _db = db;
    }

    // ============================================================
    // GET USER PLAYLISTS
    // ============================================================

    [HttpGet]
    public async Task<IActionResult> GetPlaylists()
    {
        var userId = GetUserId();

        var playlists = await _db.Playlists
            .Where(x => x.UserId == userId)
            .Include(x => x.PlaylistSongs)
                .ThenInclude(x => x.Song)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var result = playlists.Select(playlist => new
        {
            playlist.Id,
            playlist.Name,
            playlist.Description,
            playlist.ImageUrl,
            playlist.IsPublic,
            playlist.CreatedAt,

            Songs = playlist.PlaylistSongs
                .OrderBy(x => x.Position)
                .Select(x => new
                {
                    x.Song.Id,
                    x.Song.Title,
                    x.Song.Artist,
                    x.Song.Album,
                    x.Song.ImageUrl,
                    x.Song.AudioUrl,
                    x.Song.DurationSeconds,
                    x.Position
                })
                .ToList()
        });

        return Ok(result);
    }

    // ============================================================
    // GET SINGLE PLAYLIST
    // ============================================================

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPlaylist(Guid id)
    {
        var userId = GetUserId();

        var playlist = await _db.Playlists
            .Where(x =>
                x.Id == id &&
                x.UserId == userId)
            .Include(x => x.PlaylistSongs)
                .ThenInclude(x => x.Song)
            .FirstOrDefaultAsync();

        if (playlist == null)
        {
            return NotFound(new
            {
                message = "Playlist not found."
            });
        }

        var result = new
        {
            playlist.Id,
            playlist.Name,
            playlist.Description,
            playlist.ImageUrl,
            playlist.IsPublic,
            playlist.CreatedAt,

            Songs = playlist.PlaylistSongs
                .OrderBy(x => x.Position)
                .Select(x => new
                {
                    x.Song.Id,
                    x.Song.Title,
                    x.Song.Artist,
                    x.Song.Album,
                    x.Song.ImageUrl,
                    x.Song.AudioUrl,
                    x.Song.DurationSeconds,
                    x.Position
                })
                .ToList()
        };

        return Ok(result);
    }

    // ============================================================
    // CREATE PLAYLIST
    // ============================================================

    [HttpPost]
    public async Task<IActionResult> CreatePlaylist(
        [FromBody] CreatePlaylistRequest request)
    {
        var userId = GetUserId();

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Playlist name is required."
            });
        }

        var playlist = new Playlist
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl)
                ? null
                : request.ImageUrl.Trim(),
            IsPublic = request.IsPublic,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Playlists.Add(playlist);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Playlist created successfully.",

            playlist = new
            {
                playlist.Id,
                playlist.Name,
                playlist.Description,
                playlist.ImageUrl,
                playlist.IsPublic,
                playlist.CreatedAt,
                Songs = Array.Empty<object>()
            }
        });
    }

    // ============================================================
    // UPDATE PLAYLIST
    // ============================================================

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePlaylist(
        Guid id,
        [FromBody] UpdatePlaylistRequest request)
    {
        var userId = GetUserId();

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new
            {
                message = "Playlist name is required."
            });
        }

        var playlist = await _db.Playlists
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == userId);

        if (playlist == null)
        {
            return NotFound(new
            {
                message = "Playlist not found."
            });
        }

        playlist.Name = request.Name.Trim();

        playlist.Description =
            string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim();

        playlist.ImageUrl =
            string.IsNullOrWhiteSpace(request.ImageUrl)
                ? null
                : request.ImageUrl.Trim();

        playlist.IsPublic = request.IsPublic;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Playlist updated successfully.",

            playlist = new
            {
                playlist.Id,
                playlist.Name,
                playlist.Description,
                playlist.ImageUrl,
                playlist.IsPublic,
                playlist.CreatedAt
            }
        });
    }

    // ============================================================
    // DELETE PLAYLIST
    // ============================================================

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePlaylist(Guid id)
    {
        var userId = GetUserId();

        var playlist = await _db.Playlists
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == userId);

        if (playlist == null)
        {
            return NotFound(new
            {
                message = "Playlist not found."
            });
        }

        _db.Playlists.Remove(playlist);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Playlist deleted successfully."
        });
    }

    // ============================================================
    // ADD SONG TO PLAYLIST
    // ============================================================

    [HttpPost("{playlistId:guid}/songs/{songId:guid}")]
    public async Task<IActionResult> AddSongToPlaylist(
        Guid playlistId,
        Guid songId)
    {
        var userId = GetUserId();

        var playlist = await _db.Playlists
            .FirstOrDefaultAsync(x =>
                x.Id == playlistId &&
                x.UserId == userId);

        if (playlist == null)
        {
            return NotFound(new
            {
                message = "Playlist not found."
            });
        }

        var song = await _db.Songs
            .FirstOrDefaultAsync(x => x.Id == songId);

        if (song == null)
        {
            return NotFound(new
            {
                message = "Song not found."
            });
        }

        var alreadyExists = await _db.PlaylistSongs
            .AnyAsync(x =>
                x.PlaylistId == playlistId &&
                x.SongId == songId);

        if (alreadyExists)
        {
            return Conflict(new
            {
                message = "Song is already in this playlist."
            });
        }

        var nextPosition = await _db.PlaylistSongs
            .Where(x => x.PlaylistId == playlistId)
            .Select(x => (int?)x.Position)
            .MaxAsync() ?? -1;

        var playlistSong = new PlaylistSong
        {
            PlaylistId = playlistId,
            SongId = songId,
            Position = nextPosition + 1,
            AddedAt = DateTime.UtcNow
        };

        _db.PlaylistSongs.Add(playlistSong);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Song added to playlist."
        });
    }

    // ============================================================
    // REMOVE SONG FROM PLAYLIST
    // ============================================================

    [HttpDelete("{playlistId:guid}/songs/{songId:guid}")]
    public async Task<IActionResult> RemoveSongFromPlaylist(
        Guid playlistId,
        Guid songId)
    {
        var userId = GetUserId();

        var playlist = await _db.Playlists
            .FirstOrDefaultAsync(x =>
                x.Id == playlistId &&
                x.UserId == userId);

        if (playlist == null)
        {
            return NotFound(new
            {
                message = "Playlist not found."
            });
        }

        var playlistSong = await _db.PlaylistSongs
            .FirstOrDefaultAsync(x =>
                x.PlaylistId == playlistId &&
                x.SongId == songId);

        if (playlistSong == null)
        {
            return NotFound(new
            {
                message = "Song is not in this playlist."
            });
        }

        _db.PlaylistSongs.Remove(playlistSong);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Song removed from playlist."
        });
    }

    // ============================================================
    // USER ID
    // ============================================================

    private Guid GetUserId()
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException();
        }

        return Guid.Parse(userId);
    }
}


// ================================================================
// REQUEST MODELS
// ================================================================

public class CreatePlaylistRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsPublic { get; set; } = true;
}


public class UpdatePlaylistRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsPublic { get; set; } = true;
}