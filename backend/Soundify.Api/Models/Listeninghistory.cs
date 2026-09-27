namespace Soundify.Api.Models;

public class ListeningHistory
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public Guid SongId { get; set; }

    public Song Song { get; set; } = null!;

    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
}