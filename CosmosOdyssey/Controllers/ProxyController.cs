using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

[Route("api/proxy")]
[ApiController]
public class ProxyController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public ProxyController(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    [HttpGet("fetch-data")]
    public async Task<IActionResult> FetchData()
    {
        string externalApiUrl = "https://cosmosodyssey.azurewebsites.net/api/v1.0/TravelPrices";

        try
        {
            var response = await _httpClient.GetAsync(externalApiUrl);
            var content = await response.Content.ReadAsStringAsync();
            return Content(content, response.Content.Headers.ContentType?.ToString() ?? "application/json");
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(500, $"Error fetching data: {ex.Message}");
        }
    }
}
