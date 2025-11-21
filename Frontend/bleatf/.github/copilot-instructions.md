# Child Security System - AI Coding Agent Instructions

## Project Overview
This is a **Next.js 16 + TypeScript + Tailwind CSS** frontend for a child security management system. The application manages parents' children with location tracking, emergency alerts, messaging, and device management. It follows a role-based architecture with **Admin** and **Parent** user types.

## Architecture Overview

### Directory Structure
- `app/` - Next.js App Router (React Server Components by default)
- `app/components/` - Reusable UI components (Alert, Message, Child cards)
- `app/login/` - Authentication page
- `app/signup/` - Role-based registration (parent/admin)
- `app/parent/` - Parent dashboards and features
- `app/admin/` - Admin dashboards and audit logging
- `public/` - Static assets

### Core User Roles
1. **Parent** - Manages children, tracks location, receives alerts, sends messages
2. **Admin** - Authenticates users, manages parent accounts, views audit logs

## Design System

### Pastel Color Palette
Defined in `app/globals.css`:
- **Primary**: `#a3d2ca` (soft teal)
- **Secondary**: `#f6d6ad` (soft peach)
- **Accent**: `#ffe5d9` (light coral)
- **Alert**: `#ffb3b3` (light red)
- **Success**: `#c1f0c1` (light green)
- **Background**: `#f9f9f9` (very light gray)

### CSS Architecture
- **Utility Classes** in `globals.css`: `.btn-primary`, `.card`, `.section`, `.alert-success`, `.alert-error`
- **Tailwind Integration**: Custom CSS variables override Tailwind defaults
- **Input/Button Styling**: Consistent focus rings with primary color, rounded corners (rounded-lg/rounded-xl)
- **Cards**: 6px padding, light border, shadow-md, flex gap-4 for content spacing

### Component Pattern
Use `'use client'` for interactive components; maintain functional component style with TypeScript props interfaces.

Example:
```tsx
type CardProps = {
  title: string;
  onAction?: () => void;
};

export default function Card({ title, onAction }: CardProps) {
  return <div className="card">...</div>;
}
```

## Key Data Models (from class diagram)

### Parent
- `phoneNumber`, `children[]`, `messages[]`, `alerts[]`
- Methods: `manageChild()`, `sendMessage()`, `trackChildLocation()`, `sendSOS()`, `generateReport()`

### Child
- `childId`, `name`, `age`, `status`, `device`, `emergencyContacts[]`
- Methods: `linkDevice()`, `unlinkDevice()`, `getDeviceStatus()`

### ChildDevice
- `deviceId`, `batteryLevel`, `status`, `isActive`, `locations[]`
- Location history drives SafeZone alerts

### Alert & Message
- Alert types: SafeZone violation, SOS, battery low, etc.
- Message status: sent, delivered, failed
- Both trigger `NotificationService`

### SafeZones
- Radius-based zones; trigger alerts when child exits
- Require `centerLatitude`, `centerLongitude`, `radiusMeters`

## Critical Workflows

### Authentication Flow
1. User logs in with email/password (hardcoded validation in login page)
2. Route to `/parent/dashboard` or `/admin/dashboard` based on credentials
3. Use `AuthenticationManager` singleton for login state (to be implemented in services)

### Parent Dashboard Navigation
```
/parent/dashboard → Main overview (children, recent alerts, device status)
/parent/children → Manage child profiles, emergency contacts
/parent/alerts → View and acknowledge alerts
/parent/messages → Send/receive messages to child devices
/parent/reports → Generate location & activity reports
/parent/sos → Emergency SOS trigger + history
```

### Admin Dashboard Navigation
```
/admin/dashboard → Overview of system (users, activity)
/admin/auditlog → View all admin actions and system events
```

## Service Interfaces (to implement)

### AuthenticationManager (Singleton)
```tsx
// Mock user validation with hardcoded credentials
authenticate(email: string, password: string): { userId: number; role: 'parent' | 'admin' }
```

### NotificationService
Sends alerts and messages to parents; used by SafeZone checks and SOS triggers.

### SOSService
`sendSOS(parentId: number, childId: number): { success: boolean; emergencyContacts: [] }`

## Mock Data Convention
Store mock data in `app/lib/mockData.ts`:
```tsx
export const mockChildren = [
  { childId: 1, name: 'Emma', age: 8, status: 'active', deviceId: 101 }
];

export const mockAlerts = [
  { alertId: 1, type: 'SafeZone Violation', description: '...', timestamp: '...' }
];
```

## Component Library

### Existing Cards (enhance as needed)
- `AlertCard` - Display alerts with acknowledge button
- `ChildCard` - Show child profile (name, age, device status)
- `MessageCard` - Display message preview
- `ReportCard` - Show report summary (type, date range, actions)

### New Components to Create
- `DeviceStatus` - Battery%, signal strength, location
- `LocationMap` - Simple coordinate display (or integrate Google Maps)
- `SafeZoneEditor` - Create/edit zones with radius
- `EmergencyContactForm` - Add/edit emergency contacts
- `AuditLogTable` - Paginated admin action log

## Form Validation Pattern
```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  if (!email.includes('@')) newErrors.email = 'Invalid email';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## Routing Convention
- Use `next/navigation` for client-side navigation: `useRouter().push('/path')`
- Protect routes via layout/middleware (not yet implemented; add later if needed)
- No route groups in use; flat structure preferred for this scope

## Development Commands
```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Build for production
npm run lint      # Run ESLint
npm start         # Start production server
```

## Common Patterns

### State Management
Use `useState` for local component state; no Redux/Context yet. Lift state to layout if shared across pages.

### Navigation Links
Use Next.js `Link` component with href; avoid hardcoded URLs in multiple places—reference constants if repeated.

### Date/Time Display
Format timestamps as: `new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString()`

### Button Actions
Prefer `onClick` handlers; distinguish between form submit (`type="submit"`) and action buttons.

## Testing & Debugging
- Check browser console for errors (F12 in Chrome/Edge)
- Mock API responses in `mockData.ts` until backend is ready
- Use React DevTools extension for state inspection
- Tailwind classes apply inline; inspect DOM to verify CSS loading

## Important Notes
- **No authentication state persistence yet**: Sessions reset on page reload (add localStorage/sessionStorage later)
- **Hardcoded mock data**: Replace with API calls when backend ready
- **SafeZone visualization**: Currently text-based; integrate Google Maps API for full map view
- **Device tracking**: Location coordinates shown as lat/long; add map integration for visual display
- **Report generation**: Implement export to PDF/CSV once data aggregation finalized
