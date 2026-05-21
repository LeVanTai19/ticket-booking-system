# Flash Sale Ticket Booking System (Backend API)

A robust backend system designed to handle high-concurrency ticket bookings during flash sales. This project demonstrates core backend concepts including **Race Condition Handling, Idempotency, and Database Transactions**.

## The Core Problems Solved

When building a ticketing system for flash sales, standard CRUD operations are not enough. This project specifically addresses the following real-world challenges:

1. **Preventing Overselling (Race Condition):** 
   When thousands of users try to buy the last 10 VIP tickets simultaneously, standard `SELECT` then `UPDATE` logic will cause overselling. 
    *Solution:* Implemented **RDBMS Atomic Updates** combined with **Row-Level Locking** in PostgreSQL to ensure absolute Data Integrity.
2. **Handling Duplicate Requests (Spam Clicks / Network Retries):**
   Users often click the "Pay" button multiple times when the network is slow.
    *Solution:* Implemented an **Idempotency Key** mechanism. Each booking request requires a unique key, preventing duplicate transactions at the database level using `UNIQUE INDEX`.
3. **Voucher Abuse Prevention:**
   Applied the same atomic update mechanism to promotional vouchers to ensure they cannot be overused beyond their limited quantity.
4. **Transaction Safety:**
   Wrapped the entire booking process (verifying voucher, deducting ticket, calculating price, creating order) inside a **Database Transaction** (`BEGIN` ... `COMMIT`/`ROLLBACK`). If any step fails, the system safely reverts everything.

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Architecture:** Layered Architecture (Routes -> Controllers -> Services)

## 📂 Project Structure

\`\`\`text
├── database/
│   └── init.sql              # Database schema & Seed data
├── src/
│   ├── config/               # Database connection setup
│   ├── routes/               # API endpoint definitions
│   ├── app/
│   │   ├── controllers/      # Request validation & Response formatting
│   │   └── services/         # Core business logic (Transactions, Locking)
│   └── index.js              # Application entry point
├── package.json
└── README.md
\`\`\`

## ⚙️ How to Setup & Run

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/LeVanTai19/ticket-booking-system.git
cd ticket-booking-system
\`\`\`

**2. Install dependencies**
\`\`\`bash
npm install
\`\`\`

**3. Database Setup**
- Ensure you have PostgreSQL installed and running.
- Create a new database named \`flashsale_ticket_db\`.
- Run the SQL script located in \`database/init.sql\` to create tables and insert mock data (1 Concert, 2 Ticket Categories, 1 Voucher).

**4. Environment Variables**
Create a \`.env\` file in the root directory and configure your database credentials:
\`\`\`env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=flashsale_ticket_db
\`\`\`

**5. Start the server**
\`\`\`bash
npm start
# or use: node src/index.js
\`\`\`
The server will run on \`http://localhost:3000\`

## 📡 API Endpoints

### 1. Customer APIs
- \`GET /api/v1/concerts\` - Retrieve a list of available concerts and tickets.
- \`POST /api/v1/bookings\` - Create a new booking (Core API handling Concurrency & Idempotency).

**Example POST \`/api/v1/bookings\` Body:**
\`\`\`json
{
    "idempotencyKey": "uuid-v4-unique-string",
    "ticketCategoryId": "ticket-uuid",
    "quantity": 2,
    "voucherId": "voucher-uuid" 
}
\`\`\`

### 2. Admin (Operation) APIs
- \`GET /api/v1/admin/bookings\` - Monitor all bookings.
- \`PATCH /api/v1/admin/bookings/:id/status\` - Manually update booking status (\`RESERVED\`, \`COMPLETED\`, \`CANCELLED\`).

## Future Improvements (V2.0 Roadmap)
- Migrate to **NestJS** and **TypeScript** for better scalability, typing, and Dependency Injection.
- Implement **Redis (Lua Scripting)** as a distributed lock layer if the traffic scales up to thousands of requests per second.
- Implement **Message Queues (RabbitMQ/Kafka)** to process bookings asynchronously.

---
*Created by Lê Văn Tài - Backend Developer Intern*