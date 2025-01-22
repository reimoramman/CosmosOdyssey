using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PriceLists.API.Models.Entities;
using Reservations.API.Models.Entities;
using Routes.API.Data;
using TravelRoutes.API.Models.Entities;


namespace Proovitoo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoutesController : Controller
    {
        private readonly RoutesDbContext routesDbContext;
        public RoutesController(RoutesDbContext routesDbContext)
        {
            this.routesDbContext = routesDbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRoutes()
        {
            //Get routes from database
            return Ok(await routesDbContext.Routes.ToListAsync());
        }

        [HttpGet]
        [Route("{id:Guid}")]
        [ActionName("GetRouteById")]
        public async Task<IActionResult> GetRouteById([FromRoute] Guid id)
        {
            //await routesDbContext.Routes.FirstOrDefaultAsync(x => x.Id == id);
            //or

            var route = await routesDbContext.Routes.FindAsync(id);

            if (route == null)
            {
                return NotFound();
            }

            return Ok(route);
        }

        [HttpPost]
        public async Task<IActionResult> AddRoute(TravelRoute route)
        {
            route.Id = Guid.NewGuid();
            await routesDbContext.Routes.AddAsync(route);
            await routesDbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRouteById), new { id = route.Id }, route);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateRoute([FromRoute] Guid id, [FromBody] TravelRoute updatedRoute)
        {
            var existingRoute = await routesDbContext.Routes.FindAsync(id);

            if (existingRoute == null)
            {
                return NotFound();
            }

            existingRoute.Origin = updatedRoute.Origin;
            existingRoute.Destination = updatedRoute.Destination;

            await routesDbContext.SaveChangesAsync();
            return Ok(existingRoute);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteRoute([FromRoute] Guid id)
        {
            var existingRoute = await routesDbContext.Routes.FindAsync(id);

            if (existingRoute == null)
            {
                return NotFound();
            }

            routesDbContext.Routes.Remove(existingRoute);
            await routesDbContext.SaveChangesAsync();

            return Ok();
        }
    }
    /*public class PriceListController : Controller
    {
        private readonly RoutesDbContext routesDbContext;
        public PriceListController(RoutesDbContext routesDbContext)
        {
            this.routesDbContext = routesDbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPricelist()
        {
            return Ok(await routesDbContext.PriceList.ToListAsync());
        }

        [HttpGet]
        [Route("{id:Guid}")]
        [ActionName("GetPriceListById")]
        public async Task<IActionResult> GetPriceListById([FromRoute] Guid id)
        {

            var pricelist = await routesDbContext.PriceList.FindAsync(id);

            if (pricelist == null)
            {
                return NotFound();
            }

            return Ok(pricelist);
        }

        [HttpPost]
        public async Task<IActionResult> AddPriceList(PriceList pricelist)
        {
            pricelist.Id = Guid.NewGuid();
            await routesDbContext.PriceList.AddAsync(pricelist);
            await routesDbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPriceListById), new { id = pricelist.Id }, pricelist);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdatePriceList([FromRoute] Guid id, [FromBody] PriceList updatedPriceList)
        {
            var existingPriceList = await routesDbContext.PriceList.FindAsync(id);

            if (existingPriceList == null)
            {
                return NotFound();
            }

            existingPriceList.Price = updatedPriceList.Price;
            existingPriceList.CompanyName = updatedPriceList.CompanyName;
            existingPriceList.StartTime = updatedPriceList.StartTime;
            existingPriceList.EndTime = updatedPriceList.EndTime;
            existingPriceList.ValidUntil = updatedPriceList.ValidUntil;

            await routesDbContext.SaveChangesAsync();
            return Ok(existingPriceList);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeletePriceList([FromRoute] Guid id)
        {
            var existingPriceList = await routesDbContext.PriceList.FindAsync(id);

            if (existingPriceList == null)
            {
                return NotFound();
            }

            routesDbContext.PriceList.Remove(existingPriceList);
            await routesDbContext.SaveChangesAsync();

            return Ok();
        }
    }*/

   /* public class ReservationController : Controller
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
        public async Task<IActionResult> AddReservation(Reservation reservation)
        {
            reservation.Id = Guid.NewGuid();
            await routesDbContext.Reservations.AddAsync(reservation);
            await routesDbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetReservationById), new { id = reservation.Id }, reservation);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateReservation([FromRoute] Guid id, [FromBody] Reservation updatedReservation)
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
    }*/
}
