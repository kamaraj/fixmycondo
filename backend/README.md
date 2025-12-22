# FixMyCondo Backend

## Tenant Complaint & Maintenance Management SaaS

A comprehensive solution for condo/apartment management in Malaysia & Singapore.

## Tech Stack

- **Framework**: FastAPI
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: SQLAlchemy (Async)
- **Cache/Queue**: Redis
- **Authentication**: JWT (python-jose)

## Features

- 🏢 Building & Unit Management
- 👤 User Management (Residents, Technicians, Admins, Vendors)
- 🔧 Complaint/Maintenance Request System with SLA Tracking
- 📅 Facility Booking with Conflict Detection
- 🏆 Vendor Quote Management & Comparison
- 📢 Announcement System
- 📊 Dashboard & Analytics

## Quick Start

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example env file
copy .env.example .env

# Edit .env with your settings
```

### 4. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Complaints
- `POST /api/complaints/` - Create complaint
- `GET /api/complaints/` - List complaints (with filters)
- `GET /api/complaints/{id}` - Get complaint details
- `PATCH /api/complaints/{id}` - Update complaint
- `POST /api/complaints/{id}/updates` - Add timeline update

### Buildings & Units
- `POST /api/buildings/` - Create building
- `GET /api/buildings/` - List buildings
- `POST /api/buildings/{id}/units` - Create unit
- `GET /api/buildings/{id}/units` - List units

### Facilities & Bookings
- `POST /api/facilities/` - Create facility
- `GET /api/facilities/` - List facilities
- `POST /api/facilities/bookings` - Create booking
- `GET /api/facilities/bookings` - List bookings

### Vendors & Quotes
- `POST /api/vendors/` - Create vendor
- `GET /api/vendors/` - List vendors
- `POST /api/vendors/quotes` - Submit quote
- `GET /api/vendors/quotes/complaint/{id}` - Get complaint quotes

### Announcements
- `POST /api/announcements/` - Create announcement
- `GET /api/announcements/` - List announcements
- `POST /api/announcements/{id}/publish` - Publish announcement

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/complaint-stats` - Get complaint analytics
- `GET /api/dashboard/technician-stats` - Get technician performance

## Database Models

- **Building** - Condo/apartment building info
- **Unit** - Individual units/apartments
- **User** - All user types (residents, technicians, admins)
- **Complaint** - Maintenance requests with SLA tracking
- **ComplaintUpdate** - Timeline updates for complaints
- **Vendor** - External contractors
- **VendorQuote** - Vendor quotes for jobs
- **Facility** - Bookable facilities
- **FacilityBooking** - Booking records
- **Announcement** - Building announcements

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application
│   ├── config.py        # Settings management
│   ├── database.py      # Database configuration
│   ├── models/
│   │   └── __init__.py  # SQLAlchemy models
│   ├── schemas/
│   │   └── __init__.py  # Pydantic schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py      # Authentication service
│   │   └── sla_engine.py # SLA calculation
│   └── api/
│       ├── __init__.py  # API router
│       ├── auth.py
│       ├── complaints.py
│       ├── buildings.py
│       ├── facilities.py
│       ├── vendors.py
│       ├── announcements.py
│       └── dashboard.py
├── requirements.txt
├── .env.example
└── README.md
```

## License

MIT License
