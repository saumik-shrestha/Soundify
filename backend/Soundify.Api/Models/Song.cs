namespace Soundify.Api.Models;

public class Song
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Artist { get; set; } = string.Empty;

    public string? Album { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string AudioUrl { get; set; } = string.Empty;

    public int DurationSeconds { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PlaylistSong> PlaylistSongs { get; set; }
        = new List<PlaylistSong>();

    public ICollection<Like> Likes { get; set; }
        = new List<Like>();

    public ICollection<ListeningHistory> ListeningHistory { get; set; }
        = new List<ListeningHistory>();
}