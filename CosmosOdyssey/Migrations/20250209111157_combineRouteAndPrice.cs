using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosmosOdyssey.Migrations
{
    /// <inheritdoc />
    public partial class combineRouteAndPrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TravelRouteId",
                table: "PriceList");

            migrationBuilder.AddColumn<string>(
                name: "Destination",
                table: "PriceList",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Origin",
                table: "PriceList",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Destination",
                table: "PriceList");

            migrationBuilder.DropColumn(
                name: "Origin",
                table: "PriceList");

            migrationBuilder.AddColumn<Guid>(
                name: "TravelRouteId",
                table: "PriceList",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }
    }
}
