Setup Guide

This project was made using Visual Studio 2022 and SQL Server Managment Studio 20
https://visualstudio.microsoft.com/downloads/

https://www.microsoft.com/en-us/sql-server/sql-server-downloads

Open Visual Studio and copy the project to Visual Studio

![image](https://github.com/user-attachments/assets/0ad07cb1-a5ea-4b9f-a75d-6c616c6adc4e)


In the file updatePriselist.js at the very top of the file make sure the URL is correct for when you launc the projecct 

![image](https://github.com/user-attachments/assets/0daac02a-e78f-4bed-85de-6e7d69f07517)

Under the Program.cs file change the name of the server to the one one shall be using 

![image](https://github.com/user-attachments/assets/0f740529-0460-4cbe-a0a5-5d241b603a6b)

To find the name of ones server open SQL Server Managment Studio and you will be greeted with a popup where you can see the name of ones server

![image](https://github.com/user-attachments/assets/03cc3343-6776-48aa-ba3a-23b57e00aad1)

Once the changes are made you can run the project in Visual Studio. It will oepen up the Swagger page for the API-s where one
can see and use the API-s to add/change/delete reservations and more. But to see the webpage one needs to modify the URL of 
the webpage that was opened. One can simply edit the URL but it is more convenient to open another tab and copy the url there with
the change of deleting the swagger part from the URL.
https://localhost:7066/swagger/index.html
https://localhost:7066/index.html

In the actual webpage one choose Origin and Destination 

![image](https://github.com/user-attachments/assets/9b3818f4-cacb-460c-975f-819b5138f8b5)

Find the route one likes and then reserve the flight. One can also use the filters to help find the perfect route

![image](https://github.com/user-attachments/assets/c7104ad2-d5ca-4df6-b584-5a5b336dbe5c)

To see the reservation go back to the Swagger page and execute the GET Reservation API

![image](https://github.com/user-attachments/assets/185c53b3-5006-4507-a293-49fbb35d8aa6)

![image](https://github.com/user-attachments/assets/2f5883ef-931f-447b-8623-0ebc89e0f5c0)


To see the flights copy or memorice the Id of the reservation and use the GET PriceReservation API
![image](https://github.com/user-attachments/assets/138dca61-48fd-4e38-8680-2b66e426292a)
![image](https://github.com/user-attachments/assets/df447af5-2fea-4f42-a388-6a97e1bdc150)
