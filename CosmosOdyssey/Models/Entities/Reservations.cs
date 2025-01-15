namespace Reservations.API.Models.Entities
{
    public class Reservation
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public List<Route> Routes { get; set; }
        public decimal TotalPrice { get; set; }
        public TimeSpan TotalTravelTime { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
