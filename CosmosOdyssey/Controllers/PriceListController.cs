using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PriceLists.API.Models.Entities;
using Routes.API.Data;

namespace CosmosOdyssey.Controllers
{
    [ApiController]
    [Route("api/pricelist")]
    public class PriceListController : Controller
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

        // Get pricelist items that have not expired
        [HttpGet]
        [Route("active")]
        [ActionName("GetActivePriceList")]
        public async Task<IActionResult> GetActivePriceList()
        {
            var time = DateTime.Now.ToUniversalTime();
            var pricelist = routesDbContext.PriceList.Where(f => f.ValidUntil > time);

            if (pricelist == null)
            {
                return NotFound();
            }

            return Ok(pricelist);
        }

        [HttpGet]
        [Route("{time:DateTime}")]
        [ActionName("GetActivePriceList")]
        public async Task<IActionResult> GetActivePriceList([FromRoute] DateTime time)
        {
            time = time.ToUniversalTime();
            var validTime = DateTime.Now.ToUniversalTime();
            var pricelist = routesDbContext.PriceList.Where(f => f.ValidUntil > validTime && f.StartTime > time);

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
            existingPriceList.Distance = updatedPriceList.Distance;

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
    }
}
