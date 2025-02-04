using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosmosOdyssey.Migrations
{
    /// <inheritdoc />
    public partial class simplifyRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PriceList_Routes_TravelRouteId",
                table: "PriceList");

            migrationBuilder.DropTable(
                name: "PriceListReservation");

            migrationBuilder.DropIndex(
                name: "IX_PriceList_TravelRouteId",
                table: "PriceList");

            migrationBuilder.DropColumn(
                name: "PriceReservationId",
                table: "PriceList");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PriceReservationId",
                table: "PriceList",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "PriceListReservation",
                columns: table => new
                {
                    PriceListId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReservationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceListReservation", x => new { x.PriceListId, x.ReservationId });
                    table.ForeignKey(
                        name: "FK_PriceListReservation_PriceList_PriceListId",
                        column: x => x.PriceListId,
                        principalTable: "PriceList",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PriceListReservation_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "Reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PriceList_TravelRouteId",
                table: "PriceList",
                column: "TravelRouteId");

            migrationBuilder.CreateIndex(
                name: "IX_PriceListReservation_ReservationId",
                table: "PriceListReservation",
                column: "ReservationId");

            migrationBuilder.AddForeignKey(
                name: "FK_PriceList_Routes_TravelRouteId",
                table: "PriceList",
                column: "TravelRouteId",
                principalTable: "Routes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
