
using Microsoft.EntityFrameworkCore;

namespace Routes.API.Data
{
    public class RoutesDbContext : DbContext
    {
        public RoutesDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<APi.Models.Entities.Route> Routes { get; set; }
    }
}
