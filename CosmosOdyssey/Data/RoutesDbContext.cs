using Microsoft.EntityFrameworkCore;
using PriceLists.API.Models.Entities;
using Reservations.API.Models.Entities;
using TravelRoutes.API.Models.Entities;
using PriceReservations.API.Models.Entities;

namespace Routes.API.Data
{
    public class RoutesDbContext : DbContext
    {
        public RoutesDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<TravelRoute> Routes { get; set; }
        public DbSet<Reservation> Reservations {  get; set; }
        public DbSet<PriceList> PriceList { get; set; }
        public DbSet<PriceReservation> PriceReservation { get; set; }

    }
}
