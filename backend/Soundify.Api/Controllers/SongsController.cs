using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Soundify.Api.Data;

namespace Soundify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    private readonly SoundifyDbContext _db;

    public SongsController(SoundifyDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetSongs()
    {
        var songs = await _db.Songs
            .OrderByDescending(song => song.CreatedAt)
            .Select(song => new
            {
                song.Id,
                song.Title,
                song.Artist,
                song.Album,
                song.ImageUrl,
                song.AudioUrl,
                song.DurationSeconds
            })
            .ToListAsync();

        return Ok(songs);
    }
}