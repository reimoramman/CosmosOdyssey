using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PriceLists.API.Models.Entities;
using PriceReservations.API.Models.Entities;
using Reservations.API.Models.Entities;
using Routes.API.Data;

namespace CosmosOdyssey.Controllers
{
    [ApiController]
    [Route("api/reservation")]

    public class PriceReservationController : Controller
    {
        private readonly RoutesDbContext routesDbContext;
        public PriceReservationController(RoutesDbContext routesDbContext)
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
        [ActionName("GetPriceReservationById")]
        public async Task<IActionResult> GetpriceReservationById([FromRoute] Guid id)
        {

            var reservation = await routesDbContext.Reservations.FindAsync(id);

            if (reservation == null)
            {
                return NotFound();
            }

            return Ok(reservation);
        }



        [HttpPost]
        public async Task<IActionResult> AddPriceList(PriceReservation priceReservation)
        {
            priceReservation.Id = Guid.NewGuid();
            await routesDbContext.PriceReservation.AddAsync(priceReservation);
            await routesDbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetpriceReservationById), new { id = priceReservation.Id }, priceReservation);
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

            existingPriceReservation.ReservationId = updatedPriceReservation.ReservationId;
            existingPriceReservation.PriceId = updatedPriceReservation.PriceId;

            await routesDbContext.SaveChangesAsync();
            return Ok(existingPriceReservation);
        }


    }
}