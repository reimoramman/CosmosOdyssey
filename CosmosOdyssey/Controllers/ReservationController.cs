using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PriceReservations.API.Models.Entities;
using Reservations.API.Models.Entities;
using Routes.API.Data;

namespace CosmosOdyssey.Controllers
{
    [ApiController]
    [Route("api/reservation")]
    public class ReservationController : Controller
    {
        private readonly RoutesDbContext routesDbContext;
        public ReservationController(RoutesDbContext routesDbContext)
        {
            this.routesDbContext = routesDbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReservations()
        {
            return Ok(await routesDbContext.Reservations.ToListAsync());
        }

        [HttpGet]
        [Route("{id:Guid}")]
        [ActionName("GetReservationById")]
        public async Task<IActionResult> GetReservationById([FromRoute] Guid id)
        {

            var reservation = await routesDbContext.Reservations.FindAsync(id);

            if (reservation == null)
            {
                return NotFound();
            }

            return Ok(reservation);
        }

        [HttpPost]
        public async Task<IActionResult> AddReservation([FromBody] Reservation reservation)
        {
            if (reservation == null)
            {
                return BadRequest("Reservation data is missing.");
            }

            reservation.Id = Guid.NewGuid();
            reservation.CreatedAt = DateTime.UtcNow;
            await routesDbContext.Reservations.AddAsync(reservation);
            await routesDbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetReservationById), new { id = reservation.Id }, reservation);
        }



        [HttpPut("{id:Guid}")]
        public async Task<IActionResult> UpdateReservation(Guid id, [FromBody] Reservation updatedReservation)
        {
            var existingReservation = await routesDbContext.Reservations.FindAsync(id);

            if (existingReservation == null)
            {
                return NotFound();
            }

            existingReservation.FirstName = updatedReservation.FirstName;
            existingReservation.LastName = updatedReservation.LastName;
            existingReservation.TotalPrice = updatedReservation.TotalPrice;
            existingReservation.TotalTravelTime = updatedReservation.TotalTravelTime;
            existingReservation.CreatedAt = updatedReservation.CreatedAt;

            await routesDbContext.SaveChangesAsync();
            return Ok(existingReservation);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteReservation([FromRoute] Guid id)
        {
            var existingReservation = await routesDbContext.Reservations.FindAsync(id);

            if (existingReservation == null)
            {
                return NotFound();
            }

            routesDbContext.Reservations.Remove(existingReservation);
            await routesDbContext.SaveChangesAsync();

            return Ok();
        }
    }
}
