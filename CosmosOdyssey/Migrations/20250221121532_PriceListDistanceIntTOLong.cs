using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosmosOdyssey.Migrations
{
    /// <inheritdoc />
    public partial class PriceListDistanceIntTOLong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "Distance",
                table: "PriceList",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Distance",
                table: "PriceList",
                type: "int",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");
        }
    }
}
