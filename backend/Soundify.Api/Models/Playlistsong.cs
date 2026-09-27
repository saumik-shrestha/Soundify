namespace Soundify.Api.Models;

public class PlaylistSong
{
    public Guid PlaylistId { get; set; }

    public Playlist Playlist { get; set; } = null!;

    public Guid SongId { get; set; }

    public Song Song { get; set; } = null!;

    public int Position { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}