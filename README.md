# FixMyCondo - Tenant Complaint Management System

A comprehensive mobile/web application for condo residents to report maintenance issues and track their resolution.

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** for backend
- **Node.js 18+** for mobile/web app
- **Git** for version control

### Start the Application

**Option 1: Use Batch Scripts (Windows)**
```bash
# Terminal 1: Start Backend
start_backend.bat

# Terminal 2: Start Mobile/Web App  
start_mobile.bat
```

**Option 2: Manual Start**
```bash
# Terminal 1: Backend (Port 9030)
cd backend
pip install -r requirements.txt
python seed_data.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 9030

# Terminal 2: Mobile/Web (Port 9031)
cd mobile
npm install
npx expo start --web --port 9031
```

## 🔐 Test Login Credentials

### Quick Access (Pre-filled on Login Page)

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Resident** | `ahmad.hassan@gmail.com` | `User@123` | Tenant in Unit 01-01 |
| **Technician** | `raju.tech@fixmycondo.com` | `Tech@123` | Plumbing Specialist |
| **Admin** | `admin@fixmycondo.com` | `Admin@123` | Super Administrator |

### All Test Accounts

#### Residents (Password: `User@123`)
| Email | Name | Unit |
|-------|------|------|
| `ahmad.hassan@gmail.com` | Ahmad Hassan | Block A, 01-01 |
| `sarah.tan@hotmail.com` | Sarah Tan | Block A, 02-01 |
| `weiming.chen@outlook.com` | Wei Ming Chen | Block B, 03-01 |
| `priya.kumar@gmail.com` | Priya Kumar | Block B, 04-01 |
| `raj.sharma@yahoo.com` | Raj Sharma | Block C, 05-01 |

#### Technicians (Password: `Tech@123`)
| Email | Name | Speciality |
|-------|------|------------|
| `raju.tech@fixmycondo.com` | Raju Plumber | Plumbing |
| `ali.tech@fixmycondo.com` | Ali Electrician | Electrical |
| `kumar.tech@fixmycondo.com` | Kumar HVAC | HVAC/Air-con |

#### Admins (Password: `Admin@123`)
| Email | Name | Role |
|-------|------|------|
| `admin@fixmycondo.com` | Super Admin | Super Administrator |
| `jennifer.lee@condomanagement.com` | Jennifer Lee | Building Admin |
| `faiz@condomanagement.com` | Mohammed Faiz | Building Admin |

## 📍 URLs & Ports

| Service | Port | URL |
|---------|------|-----|
| **Backend API** | 9030 | http://localhost:9030 |
| **API Documentation** | 9030 | http://localhost:9030/docs |
| **Web App** | 9031 | http://localhost:9031 |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FixMyCondo System                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Mobile    │    │    Web      │    │  Technician │     │
│  │  (Expo Go)  │    │  (Browser)  │    │    App      │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                 │
│                            ▼                                 │
│                   ┌────────────────┐                        │
│                   │  FastAPI       │                        │
│                   │  Backend       │                        │
│                   │  (Port 9030)   │                        │
│                   └────────┬───────┘                        │
│                            │                                 │
│                            ▼                                 │
│                   ┌────────────────┐                        │
│                   │    SQLite      │                        │
│                   │   Database     │                        │
│                   └────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Features

### For Residents
- ✅ Submit maintenance complaints with photos
- ✅ Track complaint status in real-time
- ✅ View complaint timeline/history
- ✅ Book facility reservations
- ✅ View building announcements

### For Technicians
- ✅ View assigned jobs
- ✅ Update job status
- ✅ Add work notes and photos
- ✅ Mark jobs as completed

### For Admins
- ✅ Dashboard with statistics
- ✅ Manage complaints and assignments
- ✅ View SLA compliance
- ✅ Manage users and buildings

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Async ORM
- **SQLite** - Database (dev) / PostgreSQL (prod)
- **Pydantic** - Data validation
- **JWT** - Authentication

### Frontend
- **React Native** - Cross-platform mobile
- **Expo Router** - File-based routing
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📂 Project Structure

```
Condo/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── seed_data.py      # Database seeding
│   └── requirements.txt  # Python deps
│
├── mobile/
│   ├── app/              # Expo Router pages
│   │   ├── (auth)/       # Login/Register
│   │   ├── (tabs)/       # Main tabs
│   │   ├── complaint/    # Complaint screens
│   │   └── technician/   # Technician screens
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   └── services/         # API services
│
├── start_backend.bat     # Quick start backend
├── start_mobile.bat      # Quick start mobile
└── README.md
```

## 🔧 Development

### Re-seed Database
```bash
cd backend
python seed_data.py
```

### API Documentation
Visit http://localhost:9030/docs for interactive Swagger documentation.

## 📄 License

MIT License - Free to use for personal and commercial projects.
