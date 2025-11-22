const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/bleat/api';

// ============== INTERFACES ==============

// Auth Interfaces
export interface LoginRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  userId: number;
  name: string;
  message: string;
}

export interface SignupRequest {
  name: string;
  password: string;
  phoneNumber: string;
  role: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId: number;
}

// Child Interfaces
export interface ChildDto {
  id: number;
  name: string;
  age: number;
}

export interface AddChildRequest {
  name: string;
  age: number;
}

export interface AddChildResponse {
  success: boolean;
  message: string;
  childId: number;
}

export interface UpdateChildRequest {
  name: string;
  age: number;
}

export interface UpdateChildResponse {
  success: boolean;
  message: string;
  childId: number;
}

// Location Interfaces
export interface LocationDto {
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Device Interfaces
export interface DeviceStatusDto {
  deviceId: number;
  status: string;
  batteryLevel: number;
  active: boolean;
  checkedAt: string;
}

export interface PairDeviceResponse {
  success: boolean;
  message: string;
  pairingCode: string;
}

export interface DeactivateDeviceResponse {
  success: boolean;
  message: string;
  childId: number;
}

// Message Interfaces
export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  messageId: number;
  sentAt: string;
}

// Alert/SOS Interfaces
export interface SosAlertResponse {
  success: boolean;
  message: string;
  alertId: number;
  timestamp: string;
}

export interface AlertDto {
  alertId: number;
  type: string;
  message: string;
  timestamp: string;
}

// Emergency Contact Interfaces
export interface EmergencyContactDto {
  contactId: number;
  name: string;
  phoneNumber: string;
  relation: string;
}

export interface AddEmergencyContactRequest {
  name: string;
  phoneNumber: string;
  relation: string;
}

export interface AddEmergencyContactResponse {
  success: boolean;
  message: string;
  contactId: number;
}

// Safe Zone Interfaces
export interface SafeZoneDto {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface AddSafeZoneRequest {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface AddSafeZoneResponse {
  success: boolean;
  message: string;
  zoneId: number;
}

// Report Interfaces
export interface GenerateReportRequest {
  reportType: string;
  startDate?: string;
  endDate?: string;
}

export interface GenerateReportResponse {
  success: boolean;
  message: string;
  reportId: number;
  reportType: string;
  generatedAt: string;
}

// Admin interfaces
export interface UserDto {
  userId: number;
  name: string;
  status: string;
}

export interface AuthenticateUserRequest {
  approve: boolean;
  reason?: string;
}

export interface AuthenticateUserResponse {
  success: boolean;
  message: string;
  userId: number;
}

// ============== API SERVICE CLASS ==============

export class ApiService {
  
  // ---- AUTHENTICATION ENDPOINTS ----
  
  static async login(name: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, password }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // ---- CHILD MANAGEMENT ENDPOINTS ----

  static async addChild(parentId: number, data: AddChildRequest): Promise<AddChildResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/add-child`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Add child error:', error);
      throw error;
    }
  }

  static async getChildren(parentId: number): Promise<ChildDto[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/parent/children/${parentId}`,
        {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch children error:', error);
      throw error;
    }
  }

  static async updateChild(parentId: number, childId: number, data: UpdateChildRequest): Promise<UpdateChildResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/update`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update child error:', error);
      throw error;
    }
  }

  static async deleteChild(parentId: number, childId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/delete`, {
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete child error:', error);
      throw error;
    }
  }

  // ---- LOCATION TRACKING ENDPOINTS ----

  static async trackChildLocation(parentId: number, childId: number): Promise<LocationDto | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/parent/${parentId}/child/${childId}/track-location`,
        {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Track location error:', error);
      throw error;
    }
  }

  static async getLocationHistory(parentId: number, childId: number): Promise<LocationDto[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/parent/${parentId}/child/${childId}/location-history`,
        {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get location history error:', error);
      throw error;
    }
  }

  // ---- DEVICE MANAGEMENT ENDPOINTS ----

  static async getDeviceStatus(parentId: number, childId: number): Promise<DeviceStatusDto | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/parent/${parentId}/child/${childId}/device-status`,
        {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get device status error:', error);
      throw error;
    }
  }

  static async pairDevice(parentId: number, childId: number): Promise<PairDeviceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/pair-device`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ deviceId: '' }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Pair device error:', error);
      throw error;
    }
  }

  static async deactivateDevice(parentId: number, childId: number, permanent: boolean = false): Promise<DeactivateDeviceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/device/deactivate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ permanent }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Deactivate device error:', error);
      throw error;
    }
  }

  static async reactivateDevice(parentId: number, childId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/device/reactivate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Reactivate device error:', error);
      throw error;
    }
  }

  // ---- MESSAGE ENDPOINTS ----

  static async sendMessage(parentId: number, childId: number, messageContent: string): Promise<SendMessageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/send-message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: messageContent }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  // ---- SOS & ALERTS ENDPOINTS ----

  static async triggerSos(parentId: number, childId: number): Promise<SosAlertResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/sos/emergency-services`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: 'Emergency SOS triggered' }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Trigger SOS error:', error);
      throw error;
    }
  }

  static async getAlerts(parentId: number): Promise<AlertDto[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/parent/${parentId}/alerts`,
        {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get alerts error:', error);
      throw error;
    }
  }

  static async confirmSafety(parentId: number, childId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/safety-confirmed`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Confirm safety error:', error);
      throw error;
    }
  }

  // ---- EMERGENCY CONTACTS ENDPOINTS ----

  static async getEmergencyContacts(parentId: number, childId: number): Promise<EmergencyContactDto[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/parent/${parentId}/child/${childId}/emergency-contacts`,
        {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get emergency contacts error:', error);
      throw error;
    }
  }

  static async addEmergencyContact(parentId: number, childId: number, data: AddEmergencyContactRequest): Promise<AddEmergencyContactResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/emergency-contact/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Add emergency contact error:', error);
      throw error;
    }
  }

  static async deleteEmergencyContact(parentId: number, childId: number, contactId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/emergency-contact/${contactId}/delete`, {
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete emergency contact error:', error);
      throw error;
    }
  }

  // ---- SAFE ZONES ENDPOINTS ----

  static async getSafeZones(parentId: number, childId: number): Promise<SafeZoneDto[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/parent/${parentId}/child/${childId}/safe-zones`,
        {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get safe zones error:', error);
      throw error;
    }
  }

  static async addSafeZone(parentId: number, childId: number, data: AddSafeZoneRequest): Promise<AddSafeZoneResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/safe-zone/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Add safe zone error:', error);
      throw error;
    }
  }

  static async deleteSafeZone(parentId: number, childId: number, zoneId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/safe-zone/${zoneId}/delete`, {
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete safe zone error:', error);
      throw error;
    }
  }

  // ---- REPORTS ENDPOINTS ----

  static async generateReport(parentId: number, data: GenerateReportRequest): Promise<GenerateReportResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/reports/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Generate report error:', error);
      throw error;
    }
  }

  // ---- ADMIN ENDPOINTS ----

  static async getPendingUsers(): Promise<UserDto[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/pending`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Get pending users error:', error);
      throw error;
    }
  }

  static async authenticateUser(userId: number, approve: boolean, reason?: string): Promise<AuthenticateUserResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ approve, reason }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Authenticate user error:', error);
      throw error;
    }
  }
}