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
  role?: string;
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
  deviceId?: number | null;
  deviceStatus?: string | null;
  deviceActive?: boolean;
}

export interface AddChildRequest {
  name: string;
  age: number;
  username?: string;
  password?: string;
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

export interface ShareLocationResponse {
  success: boolean;
  message: string;
  locationId: number;
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

export interface MessageDto {
  messageId: number;
  content?: string;
  message?: string;
  sentAt?: string;
  timestamp?: string;
  status?: string;
}

// Alert/SOS Interfaces
export interface SosAlertResponse {
  success: boolean;
  message: string;
  alertId: number;
  timestamp: string;
}

export interface CancelSosResponse {
  success: boolean;
  message: string;
  alertId: number;
}

export interface AlertDto {
  alertId: number;
  childId?: number;
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

export interface ReportDto {
  reportId: number;
  reportType: string;
  generatedOn: string;
  data?: string | null;
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
      const url = `${API_BASE_URL}/auth/signup`;
      console.debug('ApiService.signup -> POST', url, data);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '<<no-body>>');
        console.error('Signup failed response', { url, status: response.status, body });
        throw new Error(`HTTP error! status: ${response.status} body: ${body}`);
      }

      const json = await response.json();
      console.debug('ApiService.signup -> success', json);
      return json;
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

    // If device is not paired OR no location exists
    if (response.status === 204) {
      console.warn(`No location found for child ${childId}`);
      return null;
    }

    // Read raw text first to avoid JSON parse crashes
    const raw = await response.text();

    // Empty response body
    if (!raw || raw.trim().length === 0) {
      console.warn(`Empty location response for child ${childId}`);
      return null;
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("Invalid JSON from backend:", raw);
      return null;
    }

    // Normalize DTO so frontend never fails
    const latitude = data.latitude ?? data.lat ?? null;
    const longitude = data.longitude ?? data.lng ?? null;

    // If backend returned something but missing coords
    if (latitude === null || longitude === null) {
      console.warn(`Location data missing latitude/longitude for child ${childId}`);
      return null;
    }

    return {
      latitude,
      longitude,
      timestamp: data.timestamp ?? new Date().toISOString()
    };

  } catch (error) {
    console.error('Track location error:', error);
    return null; // <-- prevent frontend crash
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

  static async  pairDevice(parentId: number, childId: number, deviceSerial: string)
: Promise<PairDeviceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/pair-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ deviceSerial }),

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

  static async generatePairingCode(parentId: number): Promise<{ success: boolean; message?: string; code?: string } > {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/pair-code/generate`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Generate pairing code error:', error);
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

  static async getMessagesWithChild(parentId: number, childId: number): Promise<MessageDto[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/messages`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Get messages with child error:', error);
      throw error;
    }
  }

  static async getMessagesForChild(childId: number): Promise<MessageDto[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/child/${childId}/messages`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Get messages for child error:', error);
      throw error;
    }
  }

  static async acknowledgeMessageAsChild(childId: number, messageId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/child/${childId}/messages/${messageId}/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Acknowledge message as child error:', error);
      throw error;
    }
  }

  static async acknowledgeMessageAsParent(parentId: number, childId: number, messageId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/messages/${messageId}/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Acknowledge message as parent error:', error);
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

  static async childTriggerSos(childId: number, message?: string, latitude?: number, longitude?: number): Promise<SosAlertResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/child/${childId}/sos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message, latitude, longitude }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Child trigger SOS error:', error);
      throw error;
    }
  }

  static async childShareLocation(childId: number, latitude: number, longitude: number): Promise<ShareLocationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/child/${childId}/location/share`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Child share location error:', error);
      throw error;
    }
  }

  static async cancelSosAsChild(childId: number, alertId: number): Promise<CancelSosResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/child/${childId}/sos/${alertId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Cancel SOS error:', error);
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

  static async updateEmergencyContact(parentId: number, childId: number, contactId: number, data: AddEmergencyContactRequest): Promise<AddEmergencyContactResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/child/${childId}/emergency-contact/${contactId}/update`, {
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
      console.error('Update emergency contact error:', error);
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

  static async listReports(parentId: number): Promise<ReportDto[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/reports`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('List reports error:', error);
      throw error;
    }
  }

  static async downloadReport(parentId: number, reportId: number): Promise<ReportDto | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/parent/${parentId}/reports/${reportId}/download`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Download report error:', error);
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

  
  

  // ---- ADMIN: Manage Parents ----
  static async getParents(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/parents`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Get parents error:', error);
      throw error;
    }
  }

  static async addParent(data: { name: string; password: string; phoneNumber?: string }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/parents/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Add parent error:', error);
      throw error;
    }
  }

  static async updateParent(parentId: number, data: { phoneNumber?: string }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/parents/${parentId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Update parent error:', error);
      throw error;
    }
  }

  static async deactivateParent(parentId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/parents/${parentId}/deactivate`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Deactivate parent error:', error);
      throw error;
    }
  }
  static async getAuditLogs() {
  const response = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) throw new Error('Failed to load audit logs');
  return await response.json();
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