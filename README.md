# AppMovil - Responsive User Management System

A mobile-first web application designed for user management, featuring a secure authentication system and a complete administrative CRUD interface using a decoupled architecture.

## Tech Stack

* **Frontend:** Angular (NgModules architecture), Ionic Framework, Axios (HTTP requests), SweetAlert2 (UI modals).
* **Backend:** Native PHP centralized REST API (`api.php`) with full CORS support and PDO database handling.
* **Database:** MySQL relational database (`utf8mb4` encoding) with `roles` and `users` tables.

## Core Features

* **Secure Authentication:** Login system utilizing Bcrypt password verification and standardized HTTP status codes (200, 401, etc.).
* **User CRUD Operations:** Complete Create, Read, Update, and Delete capabilities integrated into the main Dashboard interface.
* **Role-Based Access Control (RBAC):** Frontend and backend validation ensuring only administrators (`role_id = 1`) can access edit and delete controls.
* **Standardized Localization:** All variables, internal code logic, and JSON responses are structured strictly in English.

## Project Structure

* **Frontend (`src/app/`):**
  * `login/`: Authentication page with custom forms and error handling.
  * `dashboard/`: Main management screen containing the user table and conditional admin controls.
* **Backend (`htdocs/appmovil-backend/`):**
  * `api.php`: Centralized router handling all GET, POST, and OPTIONS requests securely via PDO.

## Setup Instructions

1. **Database Configuration:**
   * Create a local MySQL database named `appmovil` on port `3306` using `root` with no password.
   * Execute your SQL schema script to generate the `roles` and `users` tables and seed initial data.

2. **Backend Setup:**
   * Place your PHP backend folder inside your local server directory (e.g., `C:\xampp\htdocs\appmovil-backend`).

3. **Frontend Setup:**
   * Clone this repository to your local machine.
   * Navigate to the project directory in your terminal and install dependencies:
     ```bash
     npm install
     ```
   * Run the development server:
     ```bash
     ionic serve
     ```
