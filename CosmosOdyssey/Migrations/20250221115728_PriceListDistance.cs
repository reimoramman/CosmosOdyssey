using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosmosOdyssey.Migrations
{
    /// <inheritdoc />
    public partial class PriceListDistance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Distance",
                table: "PriceList",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Distance",
                table: "PriceList");
        }
    }
}
