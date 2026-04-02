# 🧠 Wysa Personality Test Project

## 🚀 Overview

This is a full-stack personality assessment application that evaluates users through a dynamic questionnaire and tracks their responses to generate meaningful insights.

The project is built with a clear separation of frontend and backend, following a structured controller-service architecture.

---

## ✨ Features

- Dynamic personality test questionnaire
- Backend-driven question flow
- User state tracking across sessions
- Modular backend architecture (Controller → Service → Database)
- Fully deployed frontend and backend services

---

## 🛠 Tech Stack

**Frontend**

- Angular

**Backend**

- Node.js
- Express
- MongoDB

---

## 📦 Installation & Setup

### 🔹 Prerequisites

- Install Node.js and ensure it is added to environment variables
- Install Angular CLI globally:

```bash
npm install -g @angular/cli
```

---

## ⚙️ Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/DhruvSelopal/Wysa-Project.git
cd Wysa-Project
```

2. Navigate to backend folder (if separated):

```bash
cd backend
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root of backend:

```
JWT_SECRET=your_secret_key
MONGO_URI=your_mongo_connection_string
```

> Note: MongoDB is already hosted, so no need to set up a local database.

5. Run the backend server:

```bash
npm run dev
```

---

## 💻 Frontend Setup

1. Navigate to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the Angular app:

```bash
npm start
```

4. API Configuration:

- By default, `environment.ts` points to the deployed backend (Render)
- To run locally, change API URL to:

```
http://localhost:3000
```

---

## 🌐 Deployment

- Frontend deployed on Vercel
- Backend deployed on Render
- MongoDB hosted on Atlas

```

---

## 📚 How It Works (High Level)

Details about AI Architecture and flow  can be found in:
👉 `ARCHITECTURE.md`

---

## 🤖 AI Usage

Details about AI assistance can be found in:
👉 `AI_USAGE.md`

```
