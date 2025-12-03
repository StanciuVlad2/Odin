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

export interface TableResponse {
  id: number;
  tableNumber: number;
  capacity: number;
  xposition: number | null;
  yposition: number | null;
  width: number | null;
  height: number | null;
  active: boolean;
}

export interface CreateTableRequest {
  tableNumber: number;
  capacity: number;
  xPosition: number;
  yPosition: number;
  width?: number;
  height?: number;
}

export interface UpdateTableRequest {
  tableNumber?: number;
  capacity?: number;
  xPosition?: number;
  yPosition?: number;
  width?: number;
  height?: number;
  active?: boolean;
}

export interface ReservationResponse {
  id: number;
  tableId: number;
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
}

export interface CreateReservationRequest {
  tableId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  startTime: string;
  notes?: string;
}

export interface AvailabilityResponse {
  availableSlots: TimeSlotAvailability[];
}

export interface TimeSlotAvailability {
  timeSlot: string;
  startTime: string;
  endTime: string;
  tables: TableAvailability[];
}

export interface TableAvailability {
  id: number;
  tableNumber: number;
  capacity: number;
  xposition: number | null;
  yposition: number | null;
  width: number | null;
  height: number | null;
  available: boolean;
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

  // Tables API
  async getTables(): Promise<TableResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/tables`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    return await response.json();
  }

  async createTable(data: CreateTableRequest): Promise<TableResponse> {
    const response = await fetch(`${API_BASE_URL}/api/tables`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create table');
    }

    return await response.json();
  }

  async updateTable(id: number, data: UpdateTableRequest): Promise<TableResponse> {
    const response = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update table');
    }

    return await response.json();
  }

  async deleteTable(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete table');
    }
  }

  // Reservations API
  async checkAvailability(date: string, partySize?: number): Promise<AvailabilityResponse> {
    const params = new URLSearchParams({ date });
    if (partySize) {
      params.append('partySize', partySize.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/reservations/availability?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to check availability');
    }

    return await response.json();
  }

  async createReservation(data: CreateReservationRequest): Promise<ReservationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: this.getHeaders(this.isAuthenticated()),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create reservation');
    }

    return await response.json();
  }

  async getMyReservations(): Promise<ReservationResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/reservations/my-reservations`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reservations');
    }

    return await response.json();
  }

  async cancelReservation(id: number): Promise<ReservationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/reservations/${id}/cancel`, {
      method: 'PUT',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to cancel reservation');
    }

    return await response.json();
  }

  async getAllReservations(): Promise<ReservationResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/reservations/all`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all reservations');
    }

    return await response.json();
  }
}

export const apiService = new ApiService();
