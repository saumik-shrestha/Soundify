namespace Soundify.Api.Models;

public class Playlist
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsPublic { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public ICollection<PlaylistSong> PlaylistSongs { get; set; }
        = new List<PlaylistSong>();
}