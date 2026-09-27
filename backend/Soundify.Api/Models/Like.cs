namespace Soundify.Api.Models;

public class Like
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public Guid SongId { get; set; }

    public Song Song { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}