Setup Guide

This project was developed using Visual Studio 2022 and SQL Server Management Studio 20.
1️) Install Required Software

    Download Visual Studio 2022
    Download SQL Server Management Studio

2️) Open the Project in Visual Studio

    Open Visual Studio.
    Clone or copy the project into Visual Studio.

![image](https://github.com/user-attachments/assets/a3203996-b024-4c3e-ac17-13eee8c7b0de)

3️) Update the API URL in updatePricelist.js

    Open the file updatePricelist.js.
    At the very top, make sure the API URL is set correctly for your project.

![image](https://github.com/user-attachments/assets/ba6b945c-c462-4bae-abde-52f28ceaee5e)

4️) Configure the Database Connection

    Open Program.cs.
    Locate the database connection string.
    Change the server name to match the one you are using.

![image](https://github.com/user-attachments/assets/36b0af3d-f770-4b3c-8080-04df2d74e557)

! How to Find Your SQL Server Name

    Open SQL Server Management Studio (SSMS).
    A popup will appear showing your server name.

![image](https://github.com/user-attachments/assets/11980440-6b7f-4471-9003-919f4ed033cf)

5️) Run the Project in Visual Studio

    Once all changes are made, run the project in Visual Studio.
    This will open the Swagger API documentation in your browser.
    Swagger lets you test the API, allowing you to add, modify, or delete reservations.

Example URL for Swagger API:

https://localhost:7066/swagger/index.html

6️) Open the Web Application

    The Swagger page does not show the main website.
    To access the web application, modify the URL:
        Remove /swagger/index.html from the URL.
        Final URL:

        https://localhost:7066/index.html

7️) Using the Web Application
➡ Select Origin & Destination

    Choose the origin and destination for your trip.

![image](https://github.com/user-attachments/assets/dbf80d7d-4f49-41ec-ac57-bafda7dae12f)

➡ Find and Reserve a Route

    Browse available routes and reserve your flight.
    Use filters to find the best option.

![6fa46ca5-c54f-486d-9234-9a98042bc570](https://github.com/user-attachments/assets/e851326b-f9c7-487a-83d2-5a12e9fb4696)

8️) View Your Reservation

    Go back to the Swagger page.
    Execute the GET Reservation API to see your saved reservation.

![185c53b3-5006-4507-a293-49fbb35d8aa6](https://github.com/user-attachments/assets/a84eca8c-7172-4485-879d-b8fce516ca19)

![2f5883ef-931f-447b-8623-0ebc89e0f5c0](https://github.com/user-attachments/assets/d483241b-31e3-49b3-acdf-b2fcf3524019)

89) View Your Flights

    In the Swagger page.
    Execute the GET PriceReservation API to see your saved reservation.
    To find specific Reservation flights
    Copy Reservation Id and Use byReservation API
![image](https://github.com/user-attachments/assets/06a91871-2a31-4162-82d0-089ba7580f35)

![image](https://github.com/user-attachments/assets/09211fab-6d92-4854-aa66-28c3f06d50e1)


