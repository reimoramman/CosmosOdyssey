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

        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetPriceReservationById([FromRoute] Guid id)
        {
            var priceReservation = await routesDbContext.PriceReservation.FindAsync(id);

            if (priceReservation == null)
            {
                return NotFound();
            }

            return Ok(priceReservation);
        }

        [HttpPost]
        public async Task<IActionResult> AddPriceReservation(PriceReservation priceReservation)
        {
            priceReservation.Id = Guid.NewGuid();

            var reservationExists = await routesDbContext.Reservations.AnyAsync(r => r.Id == priceReservation.ReservationId);
            var priceExists = await routesDbContext.PriceList.AnyAsync(p => p.Id == priceReservation.PriceId);

            if (!reservationExists)
            {
                return BadRequest($"Invalid ReservationId: {priceReservation.ReservationId}");
            }

            if (!priceExists)
            {
                return BadRequest($"Invalid PriceId: {priceReservation.PriceId}");
            }

            await routesDbContext.PriceReservation.AddAsync(priceReservation);
            await routesDbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPriceReservationById), new { id = priceReservation.Id }, priceReservation);
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