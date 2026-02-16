# Employee-Attendance-System-by-TharunPV

**To Login Use this mail/password or User can able to create new one for Employee:**

Manager: manager@company.com / manager123  ( Mail / Password )
Employee: john@company.com / employee123  ( Mail / Password )
Or use Register to create a new employee account.

**About the Project**

Employee Attendance System is a full‑stack web application that helps employees mark daily attendance (check‑in/check‑out) and helps managers monitor team attendance with filters, summaries, calendar view, and report exports.

This project is built using React + Redux Toolkit for the frontend, Node.js + Express for the backend API, and MongoDB for the database. It supports two roles: Employee and Manager, with separate dashboards and role‑based access control using JWT authentication.

**Key Features:**

Employee: Register/Login, Check In/Check Out, Attendance History (calendar + table), Monthly Summary, Profile, Dashboard stats
Manager: Login, View all employees attendance, Filters (employee/date/status), Team Summary, Team Calendar, CSV Export Reports, Dashboard stats

**API Modules:**

Auth: Register, Login, Me
Attendance: Employee endpoints (today, history, summary, checkin/checkout) + Manager endpoints (all, summary, export, today status)
Dashboard: Employee stats + Manager stats

**Setup & Run:**

Create backend/.env using backend/.env.example and set MONGODB_URI, JWT_SECRET, and PORT.
Install dependencies in both backend and frontend.
Start the backend server, then start the frontend dev server.
Open the frontend URL (usually http://localhost:3000).
