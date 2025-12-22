# FixMyCondo Mobile

React Native Expo application for tenants and technicians.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# Or directly for specific platform
npm run android
npm run ios
npm run web
```

### API Configuration

Update the API base URL in `services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:8000/api'  // Replace with your IP
  : 'https://your-production-url.com/api';
```

## Features

### Tenant Features
- 🏠 Home Dashboard with statistics
- 🔧 Submit maintenance complaints
- 📊 Track complaint status & SLA
- 📅 Book facilities (gym, pool, hall)
- 📢 View announcements
- 👤 Profile management

### Screens

- **Auth**: Login, Register
- **Home**: Dashboard with quick actions
- **Complaints**: List, Create, Detail, Timeline
- **Bookings**: Facility booking
- **Announcements**: Building news
- **Profile**: Settings, Logout

## Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Bottom tab navigation
│   │   ├── home.tsx
│   │   ├── complaints.tsx
│   │   ├── bookings.tsx
│   │   ├── announcements.tsx
│   │   └── profile.tsx
│   ├── complaint/         # Complaint screens
│   │   ├── [id].tsx
│   │   └── create.tsx
│   ├── booking/           # Booking screens
│   │   └── create.tsx
│   ├── announcement/      # Announcement screens
│   │   └── [id].tsx
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry redirect
├── contexts/              # React contexts
│   └── AuthContext.tsx
├── services/              # API services
│   └── api.ts
├── components/            # Reusable components
├── assets/                # Images, fonts
├── app.json               # Expo config
└── package.json
```

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based)
- **State**: React Context API
- **HTTP**: Axios
- **Storage**: Expo Secure Store (tokens)
- **Icons**: @expo/vector-icons (Ionicons)
- **Dates**: date-fns
