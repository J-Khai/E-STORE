E-Store: Modern E-Commerce Platform
This is a full-stack e-commerce app built with Spring Boot, React, and PostgreSQL. It covers the basics you’d expect from a real store: product browsing, filtering, cart, orders, plus an admin dashboard to manage everything behind the scenes.
The UI leans toward a more modern “editorial” style (glassmorphism, cleaner layouts), instead of the typical plain e-commerce look.

Live Demo
You can try it here:
 	https://estore-essentials.netlify.app/
Note:
 If it’s your first time opening the site, it might take up to ~1 minute to load. The backend is hosted on Render’s free plan, which puts the server to sleep after inactivity.
Once it wakes up, everything runs normally. If you refresh or come back later (while it’s still active), it’ll load much faster.

Hosting Setup
Frontend (React): Deployed on Netlify
Backend (Spring Boot API): Hosted on Render
Database (PostgreSQL): Also hosted on Render
The frontend is static, so it loads instantly. The only delay you might notice comes from the backend waking up.

Get the Code
GitHub repo:
 https://github.com/J-Khai/E-STORE
Clone it
git clone https://github.com/J-Khai/E-STORE.git
Or just download the ZIP from GitHub if you prefer.

Run with Docker (Recommended)
This is the quickest way to spin everything up locally.
Prerequisites
Docker Desktop installed and running
Start the app
From the root folder:
docker compose up --build -d
Access
Frontend: http://localhost:3000
Backend API: http://localhost:8081

Run Locally (Without Docker)
If you want to run each part manually:
1. Database (PostgreSQL)
Create a database called estore
Update credentials in:
 backend/src/main/resources/application.yml

2. Backend (Spring Boot)
cd backend
./mvnw spring-boot:run

3. Frontend (React + Vite)
cd frontend
npm install
npm run dev
Open: http://localhost:5173

Admin Access
Use these to log into the admin dashboard:
Admin
Email: admin@estore.com
Password: password
Test Customer
Email: customer@estore.com
Password: password

Final Notes
This project was built to feel closer to a real-world setup rather than just a demo. It’s not perfect, but it’s structured in a way that you can extend add payments, improve auth, scale APIs, whatever direction you want to take it.
