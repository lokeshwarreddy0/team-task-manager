# ⬡ TaskFlow — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking progress with role-based access control.

**Live Demo:** [your-app.railway.app](https://your-app.railway.app)  
**GitHub:** [github.com/yourusername/team-task-manager](https://github.com/yourusername/team-task-manager)

---

## Features

- **Authentication** — Signup/Login with JWT, bcrypt password hashing
- **Role-Based Access Control** — Admin & Member roles with enforced permissions
- **Project Management** — Create, edit, delete projects; assign team members
- **Task Management** — Full CRUD with assignment, status tracking, priority, due dates
- **Dashboard** — Live stats: total tasks, projects, overdue tasks, status breakdown
- **Overdue Detection** — Tasks with past due dates flagged visually
- **Filtering** — Filter tasks by status, priority, and project

---

## Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create/Edit/Delete Projects | ✅ | ❌ |
| Create/Edit/Delete Tasks | ✅ | ❌ |
| Assign Tasks to Members | ✅ | ❌ |
| Update Task Status | ✅ | ✅ (own tasks) |
| View All Projects | ✅ | ✅ (assigned only) |
| View All Users | ✅ | ❌ |

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs  
**Frontend:** React 18, React Router v6, Axios  
**Deployment:** Railway (unified backend + frontend build)

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

> Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`  
> The `proxy` field in `frontend/package.json` routes API calls automatically.

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Protected | Get current user |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Protected | List accessible projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Protected | Get single project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Protected | Admin: all; Member: assigned |
| GET | `/api/tasks/project/:id` | Protected | Tasks by project |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Protected | Admin: full update; Member: status only |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| DELETE | `/api/users/:id` | Admin | Delete user |

---

## Deployment on Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variables:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_secret
   NODE_ENV=production
   PORT=5000
   ```
4. Set the **root directory** to `backend`
5. Build the React frontend: `cd frontend && npm install && npm run build`
6. Copy the `build/` folder to `backend/` (or configure Railway to serve it)
7. The backend serves the React build via Express in production mode

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── middleware/
│   │   └── auth.js           # JWT verify + role check
│   ├── models/
│   │   ├── User.js           # User schema with bcrypt
│   │   ├── Project.js        # Project schema
│   │   └── Task.js           # Task schema with relations
│   ├── routes/
│   │   ├── auth.js           # Signup, Login, Me
│   │   ├── projects.js       # CRUD + RBAC
│   │   ├── tasks.js          # CRUD + RBAC
│   │   └── users.js          # Admin user management
│   ├── .env.example
│   ├── package.json
│   └── server.js             # Express app entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js      # Axios instance with interceptor
│   │   ├── components/
│   │   │   └── Navbar.jsx    # Navigation with role badge
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx # Stats + overdue summary
│   │   │   ├── Projects.jsx  # Project CRUD
│   │   │   └── Tasks.jsx     # Task CRUD + filters
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

---

## Data Models

### User
```js
{ name, email, password (hashed), role: 'admin'|'member', timestamps }
```

### Project
```js
{ title, description, owner: User, members: [User], timestamps }
```

### Task
```js
{ title, description, project: Project, assignedTo: User, createdBy: User,
  status: 'todo'|'in-progress'|'done', priority: 'low'|'medium'|'high',
  dueDate, timestamps }
```

---

Built by Lokeshwar Reddy | KL University 2026
