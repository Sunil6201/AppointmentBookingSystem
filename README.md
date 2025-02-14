# 🚢 Container Appointment Booking System

This project is a **Container Appointment Booking System** built with **.NET 8 (Backend) and Angular 18 (Frontend)**. It allows **users** to book container appointments and **admins** to manage appointments, containers, drivers, terminals, and trucking companies.

## 📌 Project Overview

The system has **two roles**:
- **User**: Can **register/login**, book **appointments**, and cancel their own bookings.
- **Admin**: Has full control to **approve/disapprove/delete** appointments and manage:
  - Containers
  - Drivers
  - Terminals
  - Trucking Companies

### 🛠 **Key Features**
✅ **Authentication & Authorization**:  
- Secure login and registration using JWT tokens.  
- **Role-based access**: Users can **only book/cancel** their appointments, while Admins have full control.  

✅ **Appointment Booking & Management**:  
- **Users**: Can create and delete their own **container appointments**.  
- **Admins**: Can **approve/disapprove** user appointments. Status changes accordingly.  
- If a **container is booked**, it becomes **unavailable** for other users.  

✅ **Container & Driver Management (Admin)**:  
- Admins can **add, update, delete** containers, drivers, terminals, and trucking companies.  
- If an admin **deletes** an item, it is **soft deleted** (marked as inactive, but not removed from the database).  
- Soft-deleted items are **not visible on the frontend**.  

✅ **Validations & Logging**:  
- **Frontend validations** to ensure users enter correct details.  
- **Serilog Logging** for tracking system activities.  

✅ **Pagination & Performance Optimization**:  
- Implemented **pagination** for improved performance and **efficient data retrieval**.  

---

## 🚀 **Technologies Used**
### 🔹 Backend (API)
- **Language**: C#
- **Framework**: .NET 8, Entity Framework Core
- **Database**: MSSQL, Cosmos DB
- **Authentication**: JWT (JSON Web Token)
- **Logging**: Serilog
- **Cloud Services**: Azure Service Bus
- **Tools**: Visual Studio 2022, Postman, SQL Server Management Studio (SSMS)

### 🔹 Frontend (UI)
- **Framework**: Angular 18
- **Languages**: TypeScript, HTML, CSS
- **State Management**: RxJS
- **UI Components**: Angular Material
- **Tools**: VS Code, Node.js, NPM

---

## 🔧 **Installation & Setup**

### 1️⃣ **Clone the Repository**
```sh
git clone https://github.com/your-username/ContainerBookingSystem.git
cd ContainerBookingSystem
