using Reservations.API.Models.Entities;
using TravelRoutes.API.Models.Entities;

namespace PriceLists.API.Models.Entities
{
    public class PriceList
    {
        public Guid Id { get; set; }
        public decimal Price { get; set; }
        public string? CompanyName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime ValidUntil { get; set; }

        // Relationship with route
        public Guid TravelRouteId { get; set; }

    }
}
