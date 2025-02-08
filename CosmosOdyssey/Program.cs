using Microsoft.EntityFrameworkCore;
using Routes.API.Data;



var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddHttpClient(); // Register HttpClient
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<RoutesDbContext>(options =>
{
    options.UseSqlServer("Server=LAPTOP-R12SELFP;Database=CosmosDB;Trusted_Connection=True;TrustServerCertificate=True;");
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

app.UseAuthorization();

app.MapControllers();

app.Run();
