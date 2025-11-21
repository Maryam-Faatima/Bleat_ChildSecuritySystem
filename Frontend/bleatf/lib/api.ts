const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ============== INTERFACES ==============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  userId: number;
  userRole: string;
  message: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
}

export interface MessageRequest {
  parentId: number;
  childId: number;
  content: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface MessagesListResponse {
  success: boolean;
  data: any[];
  message: string;
}

export interface AddChildRequest {
  parentId: number;
  childName: string;
  childAge: number;
}

export interface ChildResponse {
  success: boolean;
  childId: number;
  message: string;
}

export interface ChildrenListResponse {
  success: boolean;
  data: any[];
  message: string;
}

// ============== API SERVICE CLASS ==============

export class ApiService {
  
  // ---- AUTHENTICATION ENDPOINTS ----
  
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
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

  static async validateToken(userId: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate?userId=${userId}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }

  // ---- MESSAGE ENDPOINTS ----

  static async sendMessage(
    parentId: number, 
    childId: number, 
    content: string
  ): Promise<MessageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ parentId, childId, content }),
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

  static async getParentMessages(parentId: number): Promise<MessagesListResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/parent/${parentId}`,
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
      console.error('Fetch parent messages error:', error);
      throw error;
    }
  }

  static async getChildMessages(childId: number): Promise<MessagesListResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/child/${childId}`,
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
      console.error('Fetch child messages error:', error);
      throw error;
    }
  }

  static async deleteMessage(messageId: number): Promise<MessageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
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
      console.error('Delete message error:', error);
      throw error;
    }
  }

  // ---- CHILDREN ENDPOINTS ----

  static async getChildrenByParent(parentId: number): Promise<ChildrenListResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/children/parent/${parentId}`,
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

  static async addChild(data: AddChildRequest): Promise<ChildResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/children/add`, {
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

  static async deleteChild(childId: number): Promise<ChildResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/children/${childId}`, {
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
}