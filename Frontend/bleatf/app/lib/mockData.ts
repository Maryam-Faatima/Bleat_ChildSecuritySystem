// Mock data for the child security system
// Use fixed timestamps to avoid hydration errors
const BASE_TIME = '2025-11-13T10:55:49Z';
const baseDate = new Date(BASE_TIME).getTime();

export const mockParent = {
  userId: 1,
  name: 'Jane Smith',
  email: 'parent@example.com',
  phoneNumber: '+1-555-0123',
  password: 'password',
};

export const mockChildren = [
  {
    childId: 1,
    name: 'Emma Johnson',
    age: 8,
    status: 'active',
    deviceId: 101,
    emergencyContacts: [
      { contactId: 1, name: 'John Johnson', phone: '+1-555-0456', relation: 'Father' },
      { contactId: 2, name: 'Sarah Miller', phone: '+1-555-0789', relation: 'Grandmother' },
    ],
  },
  {
    childId: 2,
    name: 'Liam Johnson',
    age: 11,
    status: 'active',
    deviceId: 102,
    emergencyContacts: [
      { contactId: 3, name: 'John Johnson', phone: '+1-555-0456', relation: 'Father' },
    ],
  },
];

export const mockDevices = [
  {
    deviceId: 101,
    childId: 1,
    status: 'active',
    batteryLevel: 85,
    isActive: true,
    location: { latitude: 40.7128, longitude: -74.006, timestamp: new Date(baseDate - 300000).toISOString() },
    locations: [
      { latitude: 40.7128, longitude: -74.006, timestamp: new Date(baseDate - 3600000).toISOString() },
      { latitude: 40.7139, longitude: -74.0060, timestamp: new Date(baseDate - 1800000).toISOString() },
      { latitude: 40.7128, longitude: -74.006, timestamp: new Date(baseDate - 300000).toISOString() },
    ],
  },
  {
    deviceId: 102,
    childId: 2,
    status: 'active',
    batteryLevel: 92,
    isActive: true,
    location: { latitude: 40.758, longitude: -73.9855, timestamp: new Date(baseDate - 600000).toISOString() },
    locations: [
      { latitude: 40.758, longitude: -73.9855, timestamp: new Date(baseDate - 3600000).toISOString() },
      { latitude: 40.758, longitude: -73.9855, timestamp: new Date(baseDate - 1200000).toISOString() },
    ],
  },
];

export const mockAlerts = [
  {
    alertId: 1,
    type: 'SafeZone Violation',
    description: 'Emma left the designated school zone.',
    timestamp: new Date(baseDate - 600000).toISOString(),
    isAcknowledged: false,
    childId: 1,
    childName: 'Emma Johnson',
  },
  {
    alertId: 2,
    type: 'Battery Low',
    description: 'Liam\'s device battery is below 20%.',
    timestamp: new Date(baseDate - 3600000).toISOString(),
    isAcknowledged: true,
    childId: 2,
    childName: 'Liam Johnson',
  },
  {
    alertId: 3,
    type: 'Device Offline',
    description: 'Emma\'s device is offline.',
    timestamp: new Date(baseDate - 7200000).toISOString(),
    isAcknowledged: true,
    childId: 1,
    childName: 'Emma Johnson',
  },
];

export const mockMessages = [
  {
    messageId: 1,
    childId: 1,
    content: 'Hi Mom! I\'m at soccer practice.',
    timestamp: new Date(baseDate - 1800000).toISOString(),
    status: 'delivered',
    childName: 'Emma Johnson',
    direction: 'incoming',
  },
  {
    messageId: 2,
    childId: 1,
    content: 'Stay safe and remember to drink water!',
    timestamp: new Date(baseDate - 900000).toISOString(),
    status: 'delivered',
    childName: 'Emma Johnson',
    direction: 'outgoing',
  },
  {
    messageId: 3,
    childId: 2,
    content: 'Can I go to the mall after school?',
    timestamp: new Date(baseDate - 3600000).toISOString(),
    status: 'delivered',
    childName: 'Liam Johnson',
    direction: 'incoming',
  },
];

export const mockSafeZones = [
  {
    zoneId: 1,
    name: 'School',
    centerLatitude: 40.7128,
    centerLongitude: -74.006,
    radiusMeters: 500,
    isActive: true,
  },
  {
    zoneId: 2,
    name: 'Home',
    centerLatitude: 40.7489,
    centerLongitude: -73.9680,
    radiusMeters: 300,
    isActive: true,
  },
  {
    zoneId: 3,
    name: 'Soccer Field',
    centerLatitude: 40.758,
    centerLongitude: -73.9855,
    radiusMeters: 400,
    isActive: false,
  },
];

export const mockReports = [
  {
    reportId: 1,
    generatedBy: 1,
    generatedOn: new Date(baseDate - 86400000).toISOString(),
    type: 'Location History',
    childId: 1,
    childName: 'Emma Johnson',
    timeframe: 'Last 24 hours',
    locationCount: 12,
  },
  {
    reportId: 2,
    generatedBy: 1,
    generatedOn: new Date(baseDate - 604800000).toISOString(),
    type: 'Alert Summary',
    childId: 1,
    childName: 'Emma Johnson',
    timeframe: 'Last 7 days',
    alertCount: 5,
  },
];

export const mockSOSHistory = [
  {
    sosId: 1,
    childId: 1,
    childName: 'Emma Johnson',
    timestamp: new Date(baseDate - 86400000).toISOString(),
    status: 'resolved',
    emergencyContacts: ['John Johnson', 'Sarah Miller'],
  },
  {
    sosId: 2,
    childId: 2,
    childName: 'Liam Johnson',
    timestamp: new Date(baseDate - 604800000).toISOString(),
    status: 'resolved',
    emergencyContacts: ['John Johnson'],
  },
];

export const mockAuditLogs = [
  {
    logId: 1,
    adminId: 1,
    action: 'User login',
    details: 'admin@example.com logged in',
    timestamp: new Date(baseDate - 1800000).toISOString(),
  },
  {
    logId: 2,
    adminId: 1,
    action: 'Parent account created',
    details: 'Created account for parent@example.com',
    timestamp: new Date(baseDate - 3600000).toISOString(),
  },
  {
    logId: 3,
    adminId: 1,
    action: 'Child device deactivated',
    details: 'Device 101 deactivated by admin',
    timestamp: new Date(baseDate - 7200000).toISOString(),
  },
  {
    logId: 4,
    adminId: 1,
    action: 'SOS triggered',
    details: 'Emma Johnson (Child 1) SOS trigger investigated',
    timestamp: new Date(baseDate - 86400000).toISOString(),
  },
];

export const mockAdmin = {
  userId: 100,
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'password',
};
