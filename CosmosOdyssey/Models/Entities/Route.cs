using PriceLists.API.Models.Entities;

namespace TravelRoutes.API.Models.Entities
{
    public class TravelRoute
    {
        public Guid Id { get; set; }
        public string Origin { get; set; }
        public string Destination { get; set; }
        public List<PriceList> PriceLists { get; set; } = new List<PriceList>();
    }
}
