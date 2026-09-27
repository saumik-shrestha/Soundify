using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Soundify.Api.Data;

namespace Soundify.Api.Data;

public class SoundifyDbContextFactory
    : IDesignTimeDbContextFactory<SoundifyDbContext>
{
    public SoundifyDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder =
            new DbContextOptionsBuilder<SoundifyDbContext>();

        var connectionString =
            "Host=localhost;Port=5432;Database=soundify;Username=postgres;Password=admin123";

        optionsBuilder.UseNpgsql(connectionString);

        return new SoundifyDbContext(
            optionsBuilder.Options
        );
    }
}