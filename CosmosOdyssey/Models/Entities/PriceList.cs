namespace PriceLists.API.Models.Entities
{
    public class PriceList
    {
        public Guid Id { get; set; }
        public DateTime ValidUnitil { get; set; }
        public List<Route> Routes { get; set; }

    }
}
