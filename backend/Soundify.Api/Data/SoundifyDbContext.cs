using Microsoft.EntityFrameworkCore;
using Soundify.Api.Models;

namespace Soundify.Api.Data;

public class SoundifyDbContext : DbContext
{
    public SoundifyDbContext(
        DbContextOptions<SoundifyDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Song> Songs => Set<Song>();

    public DbSet<Playlist> Playlists => Set<Playlist>();

    public DbSet<PlaylistSong> PlaylistSongs => Set<PlaylistSong>();

    public DbSet<Like> Likes => Set<Like>();

    public DbSet<ListeningHistory> ListeningHistory =>
        Set<ListeningHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Users
        modelBuilder.Entity<User>()
            .HasIndex(x => x.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();

        // PlaylistSongs
        modelBuilder.Entity<PlaylistSong>()
            .HasKey(x => new
            {
                x.PlaylistId,
                x.SongId
            });

        // Likes
        modelBuilder.Entity<Like>()
            .HasKey(x => new
            {
                x.UserId,
                x.SongId
            });

        // PlaylistSong -> Playlist
        modelBuilder.Entity<PlaylistSong>()
            .HasOne(x => x.Playlist)
            .WithMany(x => x.PlaylistSongs)
            .HasForeignKey(x => x.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);

        // PlaylistSong -> Song
        modelBuilder.Entity<PlaylistSong>()
            .HasOne(x => x.Song)
            .WithMany(x => x.PlaylistSongs)
            .HasForeignKey(x => x.SongId)
            .OnDelete(DeleteBehavior.Cascade);

        // Like -> User
        modelBuilder.Entity<Like>()
            .HasOne(x => x.User)
            .WithMany(x => x.Likes)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Like -> Song
        modelBuilder.Entity<Like>()
            .HasOne(x => x.Song)
            .WithMany(x => x.Likes)
            .HasForeignKey(x => x.SongId)
            .OnDelete(DeleteBehavior.Cascade);

        // ListeningHistory -> User
        modelBuilder.Entity<ListeningHistory>()
            .HasOne(x => x.User)
            .WithMany(x => x.ListeningHistory)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ListeningHistory -> Song
        modelBuilder.Entity<ListeningHistory>()
            .HasOne(x => x.Song)
            .WithMany(x => x.ListeningHistory)
            .HasForeignKey(x => x.SongId)
            .OnDelete(DeleteBehavior.Cascade);
 
    }
}