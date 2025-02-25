Setup Guide

This project was developed using Visual Studio 2022 and SQL Server Management Studio 20.
1️) Install Required Software

    Download Visual Studio 2022
    Download SQL Server Management Studio

2️) Open the Project in Visual Studio

    Open Visual Studio.
    Clone or copy the project into Visual Studio.

image
3️) Update the API URL in updatePricelist.js

    Open the file updatePricelist.js.
    At the very top, make sure the API URL is set correctly for your project.

image
4️) Configure the Database Connection

    Open Program.cs.
    Locate the database connection string.
    Change the server name to match the one you are using.

image
🔍 How to Find Your SQL Server Name

    Open SQL Server Management Studio (SSMS).
    A popup will appear showing your server name.

image
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

image
➡ Find and Reserve a Route

    Browse available routes and reserve your flight.
    Use filters to find the best option.

image
8️) View Your Reservation

    Go back to the Swagger page.
    Execute the GET Reservation API to see your saved reservation.

image
image
