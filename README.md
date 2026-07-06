# SecureVault

SecureVault is a secure cloud-based document management system where organizations can store and manage documents safely with authentication, authorization, document versioning, audit logs, and analytics.

## 🚀 Features
- **JWT Authentication & Authorization (RBAC)**
- **Secure File Upload/Download** with size and type restrictions
- **Advanced Search & Filtering** (by extension, date, owner)
- **Soft Delete & Recycle Bin**
- **File Preview** (PDF, PNG, JPG)
- **Admin Dashboard** with Storage & Usage Analytics
- **Detailed Audit Logs** of user activities

## 🛠 Tech Stack
- **Frontend:** React, Vite (JavaScript), Tailwind CSS, Axios, Recharts
- **Backend:** FastAPI, SQLAlchemy, SQLite, JWT, bcrypt
- **Architecture:** Monolith (Phase 1) with structured backend routing
- **Security:** Rate Limiting, Input Sanitization, MIME validation, Soft Deletes

## 📁 Folder Structure
```text
SecureVault/
├── backend/          # FastAPI Python Backend
├── frontend/         # React Vite Frontend
├── docs/             # Architecture and ER Diagrams
├── screenshots/      # App UI screenshots
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

## ⚙️ How to Run Locally

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn main:app --reload`
   - The API will run on `http://localhost:8000`

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open the application in your browser (usually `http://localhost:5173`).

## 📖 API Documentation
Once the backend is running, the interactive API documentation (Swagger UI) will be available at:
`http://localhost:8000/docs`

## 🔮 Future Scope
- Migration to PostgreSQL and Supabase Storage
- Dockerization
- Advanced version control and file expiry reminders
