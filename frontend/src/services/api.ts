const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresInSeconds: number;
}

export interface MeResponse {
  authenticated: boolean;
  email: string | null;
  roles: string[];
}

class ApiService {
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async register(data: RegisterRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Registration failed');
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }

    const authResponse: AuthResponse = await response.json();
    
    // Store token in localStorage
    localStorage.setItem('authToken', authResponse.token);
    localStorage.setItem('tokenExpiry', String(Date.now() + authResponse.expiresInSeconds * 1000));

    return authResponse;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });
    } finally {
      // Clear token from localStorage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('tokenExpiry');

    if (!token || !expiry) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > parseInt(expiry)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  async me(): Promise<MeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return await response.json();
  }
}

export const apiService = new ApiService();
