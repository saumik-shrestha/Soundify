namespace Soundify.Api.Models;

public class User
{
    public Guid Id { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? DisplayName { get; set; }

    public string? ProfileImageUrl { get; set; }

    public bool IsAdmin { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();

    public ICollection<Like> Likes { get; set; } = new List<Like>();

    public ICollection<ListeningHistory> ListeningHistory { get; set; }
        = new List<ListeningHistory>();
}