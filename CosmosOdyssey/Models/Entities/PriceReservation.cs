namespace PriceReservations.API.Models.Entities
{
    public class PriceReservation
    {
        public Guid Id { get; set; }
        public Guid ReservationId { get; set; }
        public Guid PriceId { get; set; }

    }
}
