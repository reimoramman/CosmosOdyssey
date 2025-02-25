using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PriceReservations.API.Models.Entities;
using Routes.API.Data;

namespace CosmosOdyssey.Controllers
{
    [ApiController]
    [Route("api/priceReservation")]
    public class PriceReservationController : Controller
    {
        private readonly RoutesDbContext routesDbContext;

        public PriceReservationController(RoutesDbContext routesDbContext)
        {
            this.routesDbContext = routesDbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPriceReservations()
        {
            return Ok(await routesDbContext.PriceReservation.ToListAsync());
        }

        [HttpGet("byReservation/{reservationId:Guid}")]
        public async Task<IActionResult> GetPriceReservationsByReservationId([FromRoute] Guid reservationId)
        {
            var priceReservations = await routesDbContext.PriceReservation
                .Where(pr => pr.ReservationId == reservationId) // 🔥 Filter by ReservationId
                .ToListAsync();

            if (!priceReservations.Any())
            {
                return NotFound($"No price reservations found for reservation ID: {reservationId}");
            }

            return Ok(priceReservations);
        }


        [HttpPost]
        public async Task<IActionResult> AddPriceReservation([FromBody] PriceReservation priceReservation)
        {
            if (priceReservation == null)
            {
                return BadRequest("Invalid data.");
            }

            priceReservation.Id = Guid.NewGuid();

            // Ensure Reservation & PriceList exist
            var reservationExists = await routesDbContext.Reservations.AnyAsync(r => r.Id == priceReservation.ReservationId);
            var priceExists = await routesDbContext.PriceList.AnyAsync(p => p.Id == priceReservation.PriceId);

            if (!reservationExists || !priceExists)
            {
                return BadRequest("Invalid ReservationId or PriceId.");
            }

            await routesDbContext.PriceReservation.AddAsync(priceReservation);
            await routesDbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPriceReservationsByReservationId), new { reservationId = priceReservation.ReservationId }, priceReservation);
        }


        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdatePriceReservation([FromRoute] Guid id, [FromBody] PriceReservation updatedPriceReservation)
        {
            var existingPriceReservation = await routesDbContext.PriceReservation.FindAsync(id);

            if (existingPriceReservation == null)
            {
                return NotFound();
            }

            var reservationExists = await routesDbContext.Reservations.AnyAsync(r => r.Id == updatedPriceReservation.ReservationId);
            var priceExists = await routesDbContext.PriceList.AnyAsync(p => p.Id == updatedPriceReservation.PriceId);

            if (!reservationExists || !priceExists)
            {
                return BadRequest("Invalid ReservationId or PriceId");
            }

            existingPriceReservation.ReservationId = updatedPriceReservation.ReservationId;
            existingPriceReservation.PriceId = updatedPriceReservation.PriceId;

            await routesDbContext.SaveChangesAsync();
            return Ok(existingPriceReservation);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeletePriceReservation([FromRoute] Guid id)
        {
            var existingPriceReservation = await routesDbContext.PriceReservation.FindAsync(id);

            if (existingPriceReservation == null)
            {
                return NotFound();
            }

            routesDbContext.PriceReservation.Remove(existingPriceReservation);
            await routesDbContext.SaveChangesAsync();

            return Ok();
        }
    }
}