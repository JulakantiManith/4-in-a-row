# 🎮 4 in a Row — Real-Time Multiplayer Game

A full-stack **4 in a Row (Connect Four)** game built with **React**, **Node.js**, **Express**, **Socket.IO**, and **PostgreSQL**.  
Play **against another player** or let the **Bot** join automatically if no opponent appears within 10 seconds.

---

## 🧩 Features

- Real-time multiplayer gameplay powered by **Socket.IO**
- Automatic **Bot** matchmaking after 10 seconds of waiting
- Persistent **Leaderboard** using PostgreSQL
- Modern **React** frontend with live updates
- Simple, responsive, and lightweight UI

---

## 🧱 Prerequisites

Before starting, make sure the following are installed on your system:

- **Node.js** (v16 or later)
- **npm** (comes with Node)
- **PostgreSQL** (v12 or later)
- **Git** (optional, for cloning)

---

## 🗄️ Database Schema

Run these SQL commands in your PostgreSQL shell to set up the database:

```sql
CREATE DATABASE fourinarow;
\c fourinarow;

CREATE TABLE users (
  username VARCHAR(50) PRIMARY KEY,
  wins INT DEFAULT 0
);

CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  player1 VARCHAR(50),
  player2 VARCHAR(50),
  winner VARCHAR(50),
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

# ⚙️ Project Setup

1️⃣ Navigate to Backend Folder
```
cd backend
```

2️⃣ Install Backend Dependencies
```
npm install express cors socket.io dotenv pg
```

3️⃣ Configure Environment Variables
Create a .env file in the backend folder with:
```
PORT=8080
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/fourinarow
```
Replace <username> and <password> with your PostgreSQL credentials.

4️⃣ Start Backend Server
```
node index.js
```

💻 Frontend Setup
1️⃣ Navigate to Frontend Folder
```
cd frontend
```

2️⃣ Install Frontend Dependencies
```
npm install react react-dom socket.io-client
```

3️⃣ Start React App
```
npm start
```


The app will open automatically at:
```
http://localhost:3000
```

🕹️ How to Play
1. Open two browser tabs (or two different browsers).
2. Open two browser tabs (or two different browsers).
3. Within 10 seconds, open Tab 2, enter another username (e.g., P2) → click Join Game. The game starts instantly for both players.
4. If no player joins within 10 seconds, a Bot opponent joins automatically.
5. Click on a column to drop your disc — first to connect 4 in a row wins!
6. The Leaderboard updates automatically after each match.

