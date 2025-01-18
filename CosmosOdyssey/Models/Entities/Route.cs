namespace Routes.API.Models.Entities
{
    public class Route
    {
        public Guid Id { get; set; }
        public string Origin { get; set; }
        public string Destination { get; set; }
        public string CompanyName { get; set; }
        public decimal Price { get; set; }
        public TimeSpan TravelTime { get; set; }
    }
}
