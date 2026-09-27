using Microsoft.AspNetCore.Mvc;
using Soundify.Api.Data;
using Soundify.Api.Models;

namespace Soundify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly SoundifyDbContext _db;

    public SeedController(SoundifyDbContext db)
    {
        _db = db;
    }

    [HttpPost("songs")]
    public async Task<IActionResult> SeedSongs()
    {
        // Remove existing songs so we can reseed cleanly
        _db.Songs.RemoveRange(_db.Songs);

        await _db.SaveChangesAsync();


        var songs = new List<Song>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Ko Xa Ra Tmilaai",
                Artist = "John Chamling",
                Album = "Ko Xa Ra Tmilaai",
                ImageUrl = "https://yubrajstha.com.np/uploads/697f6e5279c2b-KO-XA-RA-LYRICS-----John-Chamling.jpg",
                AudioUrl = "/music/koxaratmilai.mp3",
                DurationSeconds = 0
            },

            new()
            {
                Id = Guid.NewGuid(),
                Title = "Bardali",
                Artist = "Sushant KC",
                Album = "Bardali",
                ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTHsEDJwG2VyVd-TEdZkTLIR4TKjLKe_FVaZxp-SHWEg&s=10",
                AudioUrl = "/music/bardali.mp3",
                DurationSeconds = 0
            },

            new()
            {
                Id = Guid.NewGuid(),
                Title = "Radha",
                Artist = "Swoopna Suman",
                Album = "Radha",
                ImageUrl = "https://www.traplyrics.com/wp-content/uploads/2025/04/radha-lyrics.jpg",
                AudioUrl = "/music/radha.mp3",
                DurationSeconds = 0
            },

            new()
            {
                Id = Guid.NewGuid(),
                Title = "Dhairya",
                Artist = "Sajan Raj Vaidya",
                Album = "Dhairya",
                ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROuegDESatZPZRFdErFUlX30F_UQA8m1nbCSzdgGq9mg&s=10",
                AudioUrl = "/music/dhairya.mp3",
                DurationSeconds = 0
            },

            new()
            {
                Id = Guid.NewGuid(),
                Title = "Chitthi BHitra",
                Artist = "Sajan Raj Vaidya",
                Album = "Chitthi BHitra",
                ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_-Wjt8pMXPeV3nhY2x4ySoLJYtexBAZeMy087n4TQ_w&s=10",
                AudioUrl = "/music/chitthibhitra.mp3",
                DurationSeconds = 0
            },

            new()
            {
                Id = Guid.NewGuid(),
                Title = "Attention",
                Artist = "Charlie Puth",
                Album = "Voicenotes",
                ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBrvgdYXSuwrPdVX_nykRRNkAs5NADlj87rNaf5O9VKg&s=10",
                AudioUrl = "/music/attention.mp3",
                DurationSeconds = 0
            },

            new()
            {
                Id = Guid.NewGuid(),
                Title = "NO-BRAINER",
                Artist = "DJ Khaled, Justin Bieber, Chance the Rapper, Quavo",
                Album = "Father of Asahd",
                ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQba7h2VQuXnl0h1LDLJHO1lN96NZ2b5XXSx2Bs1c-RLw&s=10",
                AudioUrl = "/music/nobrainer.mp3",
                DurationSeconds = 0
            },

            new()
            {
                Id = Guid.NewGuid(),
                Title = "I'm the One",
                Artist = "DJ Khaled, Justin Bieber, Quavo, Chance the Rapper, Lil Wayne",
                Album = "Grateful",
                ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3x0yGVcC9JHZGsL83rCgihhM6E-Sp3m7P5X0YxHbT7g&s=10",
                AudioUrl = "/music/imtheone.mp3",
                DurationSeconds = 0
            },

            new()
            {
                Id = Guid.NewGuid(),
                Title = "Until I Found You",
                Artist = "Stephen Sanchez",
                Album = "Easy on My Eyes",
                ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPMnc_YrFdaQxzaOBW91wNi5les3WCCj8hfl2Enjy4MQ&s",
                AudioUrl = "/music/untilifoundu.mp3",
                DurationSeconds = 0
            }
        };


        _db.Songs.AddRange(songs);

        await _db.SaveChangesAsync();


        return Ok(new
        {
            message = $"{songs.Count} songs added successfully.",
            count = songs.Count
        });
    }
}