# 📚 Classroom PERN App

A full-stack classroom management system built using the **PERN Stack (PostgreSQL, Express, React, Node.js)**.  
This application helps teachers and students manage classes efficiently with features like assignments, attendance, and performance tracking.

---

## 🌐 Live Demo
👉 https://ajay-classroom-pern.vercel.app/

---

## 🧠 Tech Stack

### Frontend
- React.js
- Tailwind CSS / CSS
- Axios

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### Other Tools
- JWT Authentication
- REST API
- Git & GitHub

---

## ✨ Features

- 🔐 User Authentication (Login/Register)
- 👨‍🏫 Teacher Dashboard
- 👨‍🎓 Student Dashboard
- 📅 Attendance Management
- 📝 Assignment Upload & Submission
- 📊 Performance Tracking
- 📂 Course/Class Management
- 🔄 Real-time Data Handling

---

## 📁 Project Structure
ajay-classroom-pern/
│
├── client/ # React Frontend
├── server/ # Express Backend
├── db/ # Database Config
├── routes/ # API Routes
├── controllers/ # Business Logic
└── README.md


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

git clone https://github.com/KishanLucifer/ajay-classroom-pern.git
cd ajay-classroom-pern

2️⃣ Setup Backend
cd server
npm install
npm start

3️⃣ Setup Frontend
cd client
npm install
npm run dev
🔑 Environment Variables

Create a .env file in the server folder:

PORT=5000
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_secret_key
📡 API Endpoints (Sample

Method	Endpoint	Description

POST	/api/auth/register	Register user
POST	/api/auth/login	Login user
GET	/api/classes	Get all classes
POST	/api/assignments	Create assignment

🧪 Future Improvements
📱 Mobile Responsive UI
🔔 Notifications System
📹 Live Class Integration
📈 Advanced Analytics Dashboard
🤝 Contributing

Contributions are welcome!
Feel free to fork this repo and submit a pull request.

📄 License

This project is licensed under the MIT License.

👨‍💻 Author

Kishan Rokk

GitHub: https://github.com/KishanLucifer
⭐ Support

If you like this project, give it a ⭐ on GitHub!
