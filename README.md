Setup Guide

This project was developed using Visual Studio 2022 and SQL Server Management Studio (SSMS).

Step 1: Install Required Software

Download & Install:

    Visual Studio 2022
    SQL Server Management Studio (SSMS)

Step 2: Open the Project in Visual Studio

    Open Visual Studio.
    Clone or copy the project into Visual Studio.
    https://github.com/reimoramman/CosmosOdyssey.git

![a3203996-b024-4c3e-ac17-13eee8c7b0de](https://github.com/user-attachments/assets/be46f10f-0f26-4d7f-95d5-dc50f06705aa)

Step 3: Update the API URL in updatePricelist.js

    Open the file updatePricelist.js.
    At the very top, ensure the API URL is correct for your project.

![ba6b945c-c462-4bae-abde-52f28ceaee5e](https://github.com/user-attachments/assets/9acb473b-268f-4146-af2b-0e0385de0c76)

Step 4: Configure the Database Connection

    Open Program.cs.
    Locate the database connection string.
    Change the server name to match your SQL Server.

![36b0af3d-f770-4b3c-8080-04df2d74e557](https://github.com/user-attachments/assets/ee797872-f05b-488c-8a8d-06fadc1e29f4)

How to Find Your SQL Server Name:

    Open SQL Server Management Studio (SSMS).
    A popup will appear showing your server name.

![11980440-6b7f-4471-9003-919f4ed033cf](https://github.com/user-attachments/assets/7756f4d3-71d3-45d3-8b44-9f3e6b66d5dc)

Step 5: Apply Database Migrations

    Open NuGet Package Manager Console in Visual Studio:
    Tools → NuGet Package Manager → Package Manager Console
    Run the following command to apply the database migration:

    Update-Database

![cf17e194-b3e7-4f74-868e-1c9224db2a40](https://github.com/user-attachments/assets/75100442-0658-4176-a898-e30047aa3dba)

![28e1329b-2482-4845-b9bd-893714b8243d](https://github.com/user-attachments/assets/7f8ef1af-e300-461d-8c37-26bed6ed4f19)

Step 6: Run the Project in Visual Studio

    Click Run in Visual Studio.
    This will open Swagger API documentation in your browser.
    Swagger allows you to test the API, including:
        Adding, modifying, or deleting reservations.
        Viewing available travel routes.

Example URL for Swagger API:

https://localhost:7066/swagger/index.html

Step 7: Open the Web Application

    Swagger only shows API documentation, not the main website.
    To open the web application, modify the URL:
        Remove /swagger from the URL.
        New URL:

    https://localhost:7066/index.html

Step 8: Using the Web Application

➡ Select Your Travel Route

    Choose an Origin and Destination.
    Click Find Routes.

![dbf80d7d-4f49-41ec-ac57-bafda7dae12f](https://github.com/user-attachments/assets/719906d5-1260-4f55-b725-2e0b09bbce16)

➡ Find & Reserve a Route

    Browse available routes.
    Click Reserve to book a flight.
    Use filters to find the best option.

![e851326b-f9c7-487a-83d2-5a12e9fb4696](https://github.com/user-attachments/assets/ae0ceaab-dc43-464a-b240-c277dc8ab2bf)

Step 9: View Your Reservations

    Open the Swagger page.
    Execute the GET Reservation API to view your saved reservations.

![a84eca8c-7172-4485-879d-b8fce516ca19](https://github.com/user-attachments/assets/49112861-7932-44c8-aefb-d6490ad83af0)

![d483241b-31e3-49b3-acdf-b2fcf3524019](https://github.com/user-attachments/assets/f53309e4-9632-4f41-b7f2-8e3e0b82d96f)

Step 10: View Your Flights (Reservations & Routes)

    Open the Swagger page.
    Execute the GET PriceReservation API to see your reserved flights.
    Find a specific reservation:
        Copy the Reservation ID.
        Use the byReservation API to fetch flights for that reservation.

![06a91871-2a31-4162-82d0-089ba7580f35](https://github.com/user-attachments/assets/c934ce93-6b52-45c8-bde9-dfb6701439d3)

![09211fab-6d92-4854-aa66-28c3f06d50e1](https://github.com/user-attachments/assets/bcd42539-ec51-41e9-9add-5816d9881c5d)

