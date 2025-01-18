using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Routes.API.Data;
using Routes.API.Models.Entities;


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
        public async Task<IActionResult> AddRoute(Routes.API.Models.Entities.Route route)
        {
            route.Id = Guid.NewGuid();
            await routesDbContext.Routes.AddAsync(route);
            await routesDbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRouteById), new { id = route.Id }, route);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateRoute([FromRoute] Guid id, [FromBody] Routes.API.Models.Entities.Route updatedRoute)
        {
            var existingRoute = await routesDbContext.Routes.FindAsync(id);

            if (existingRoute == null)
            {
                return NotFound();
            }

            existingRoute.Origin = updatedRoute.Origin;
            existingRoute.Destination = updatedRoute.Destination;
            existingRoute.CompanyName = updatedRoute.CompanyName;
            existingRoute.Price = updatedRoute.Price;
            existingRoute.TravelTime = updatedRoute.TravelTime;

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
}
