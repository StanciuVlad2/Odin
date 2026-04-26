const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface RegisterRequest {
  email: string;
  password: string;
  skipEmailVerification?: boolean;
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

// ── Admin: User Management ──────────────────────────────────────────────────

export interface UserAdminResponse {
  id: number;
  email: string;
  roles: string[];
  emailVerified: boolean;
  createdAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UpdateUserRolesRequest {
  roles: string[];
}

export const ALL_ROLES = [
  "ROLE_GUEST",
  "ROLE_WAITER",
  "ROLE_CHEF",
  "ROLE_MANAGER",
  "ROLE_ADMIN",
] as const;

// ── Stock ────────────────────────────────────────────────────────────────────

export type StockType = "SOLID" | "LIQUID" | "PORTION";

export interface StockItemResponse {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minimumThreshold: number | null;
  lowStock: boolean;
  type: StockType;
}

export interface StockItemRequest {
  name: string;
  quantity: number;
  unit: string;
  minimumThreshold?: number;
  type: StockType;
}

// ── Menu Items / Recipes ─────────────────────────────────────────────────────

export interface RecipeIngredientDto {
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface MenuItemResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  available: boolean;
  imageUrl?: string | null;
  recipe: RecipeIngredientDto[];
}

export interface MenuItemRequest {
  name: string;
  description?: string;
  price: number;
  category?: string;
  available?: boolean;
  imageUrl?: string;
  recipe?: RecipeIngredientDto[];
}

// ── Orders ───────────────────────────────────────────────────────────────────

export interface OrderItemResponse {
  id: number;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  tableId: number | null;
  userId: number | null;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
  totalPrice: number;
}

export interface CreateOrderRequest {
  tableId?: number;
  notes?: string;
  items: { menuItemId: string; quantity: number }[];
}

export interface UpdateOrderStatusRequest {
  status: string;
}

// ── Feedback ────────────────────────────────────────────────────────────────

export type FoodQualityRating =
  | "POOR"
  | "BELOW_AVERAGE"
  | "AVERAGE"
  | "GOOD"
  | "EXCELLENT";
export type ServiceSpeedRating = "SLOW" | "ADEQUATE" | "FAST";

export interface CreateFeedbackRequest {
  foodQualityRating: FoodQualityRating;
  serviceSpeedRating: ServiceSpeedRating;
  wouldRecommend: boolean;
  comment?: string;
}

export interface FeedbackResponse {
  id: number;
  orderId: number;
  userId: number;
  userEmail: string;
  foodQualityRating: FoodQualityRating;
  serviceSpeedRating: ServiceSpeedRating;
  wouldRecommend: boolean;
  comment: string | null;
  createdAt: string;
}

class ApiService {
  private async extractErrorMessage(response: Response): Promise<string> {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      return json.message || json.error || text;
    } catch {
      return text || "An error occurred";
    }
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async register(data: RegisterRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
  }

  async createAdminUser(email: string, password: string): Promise<void> {
    return this.register({ email, password, skipEmailVerification: true });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }

    const authResponse: AuthResponse = await response.json();

    // Store token in localStorage
    localStorage.setItem("authToken", authResponse.token);
    localStorage.setItem(
      "tokenExpiry",
      String(Date.now() + authResponse.expiresInSeconds * 1000),
    );

    return authResponse;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: this.getHeaders(true),
      });
    } finally {
      // Clear token from localStorage regardless of API call success
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiry");
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("authToken");
    const expiry = localStorage.getItem("tokenExpiry");

    if (!token || !expiry) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > parseInt(expiry)) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiry");
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  async me(): Promise<MeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    return await response.json();
  }

  // Tables API
  async getTables(): Promise<TableResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/tables`, {
      method: "GET",
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tables");
    }

    return await response.json();
  }

  async createTable(data: CreateTableRequest): Promise<TableResponse> {
    const response = await fetch(`${API_BASE_URL}/api/tables`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create table");
    }

    return await response.json();
  }

  async updateTable(
    id: number,
    data: UpdateTableRequest,
  ): Promise<TableResponse> {
    const response = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update table");
    }

    return await response.json();
  }

  async deleteTable(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error("Failed to delete table");
    }
  }

  // Reservations API
  async checkAvailability(
    date: string,
    partySize?: number,
  ): Promise<AvailabilityResponse> {
    const params = new URLSearchParams({ date });
    if (partySize) {
      params.append("partySize", partySize.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/reservations/availability?${params}`,
      {
        method: "GET",
        headers: this.getHeaders(true),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to check availability");
    }

    return await response.json();
  }

  async createReservation(
    data: CreateReservationRequest,
  ): Promise<ReservationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/reservations`, {
      method: "POST",
      headers: this.getHeaders(this.isAuthenticated()),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }

    return await response.json();
  }

  async getMyReservations(activeOnly = false): Promise<ReservationResponse[]> {
    const url = activeOnly
      ? `${API_BASE_URL}/api/reservations/my-reservations?active=true`
      : `${API_BASE_URL}/api/reservations/my-reservations`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reservations");
    }

    return await response.json();
  }

  async cancelReservation(id: number): Promise<ReservationResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/${id}/cancel`,
      {
        method: "PUT",
        headers: this.getHeaders(true),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to cancel reservation");
    }

    return await response.json();
  }

  async getAllReservations(): Promise<ReservationResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/reservations/all`, {
      method: "GET",
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch all reservations");
    }

    return await response.json();
  }

  // ── Admin: User Management ────────────────────────────────────────────────

  async getAdminUsers(params: {
    search?: string;
    role?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<UserAdminResponse>> {
    const query = new URLSearchParams();
    if (params.search !== undefined) query.set("search", params.search);
    if (params.role) query.set("role", params.role);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    const response = await fetch(`${API_BASE_URL}/api/admin/users?${query}`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
    return await response.json();
  }

  async updateUserRoles(
    userId: number,
    roles: string[],
  ): Promise<UserAdminResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/roles`,
      {
        method: "PATCH",
        headers: this.getHeaders(true),
        body: JSON.stringify({ roles } satisfies UpdateUserRolesRequest),
      },
    );
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
    return await response.json();
  }

  async deleteAdminUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
  }

  // ── Stock API ─────────────────────────────────────────────────────────────

  async getStock(params: {
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<StockItemResponse>> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 5));

    const response = await fetch(`${API_BASE_URL}/api/stock?${query}`, {
      headers: this.getHeaders(true),
    });
    if (!response.ok) throw new Error("Failed to fetch stock");
    return response.json();
  }

  async getAllStock(search?: string): Promise<StockItemResponse[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const response = await fetch(`${API_BASE_URL}/api/stock/all${params}`, {
      headers: this.getHeaders(true),
    });
    if (!response.ok) throw new Error("Failed to fetch stock");
    return response.json();
  }

  async getLowStock(): Promise<StockItemResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/stock/low-stock`, {
      headers: this.getHeaders(true),
    });
    if (!response.ok) throw new Error("Failed to fetch low stock items");
    return response.json();
  }

  async createStockItem(data: StockItemRequest): Promise<StockItemResponse> {
    const response = await fetch(`${API_BASE_URL}/api/stock`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
    return response.json();
  }

  async updateStockItem(
    id: string,
    data: StockItemRequest,
  ): Promise<StockItemResponse> {
    const response = await fetch(`${API_BASE_URL}/api/stock/${id}`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
    return response.json();
  }

  async deleteStockItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/stock/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    if (!response.ok) throw new Error("Failed to delete stock item");
  }

  // ── Menu Items API ────────────────────────────────────────────────────────

  async getMenuItems(params?: {
    search?: string;
    category?: string;
    availableOnly?: boolean;
  }): Promise<MenuItemResponse[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.availableOnly) query.set("availableOnly", "true");
    const qs = query.toString() ? `?${query}` : "";
    const response = await fetch(`${API_BASE_URL}/api/menu-items${qs}`, {
      headers: this.getHeaders(this.isAuthenticated()),
    });
    if (!response.ok) throw new Error("Failed to fetch menu items");
    return response.json();
  }

  async getMenuItemRecipe(id: string): Promise<RecipeIngredientDto[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/menu-items/${id}/recipe`,
      {
        headers: this.getHeaders(true),
      },
    );
    if (!response.ok) throw new Error("Failed to fetch recipe");
    return response.json();
  }

  async createMenuItem(data: MenuItemRequest): Promise<MenuItemResponse> {
    const response = await fetch(`${API_BASE_URL}/api/menu-items`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
    return response.json();
  }

  async updateMenuItem(
    id: string,
    data: MenuItemRequest,
  ): Promise<MenuItemResponse> {
    const response = await fetch(`${API_BASE_URL}/api/menu-items/${id}`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
    return response.json();
  }

  async deleteMenuItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/menu-items/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    if (!response.ok) throw new Error("Failed to delete menu item");
  }

  async uploadMenuItemImage(
    id: string,
    file: File,
  ): Promise<{ imageUrl: string }> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/api/menu-items/${id}/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
    return response.json();
  }

  // ── Orders API ────────────────────────────────────────────────────────────

  async getMyOrders(): Promise<OrderResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
      headers: this.getHeaders(true),
    });
    if (!response.ok) throw new Error("Failed to fetch your orders");
    return response.json();
  }

  async getOrders(status?: string): Promise<OrderResponse[]> {
    const params = status ? `?status=${status}` : "";
    const response = await fetch(`${API_BASE_URL}/api/orders${params}`, {
      headers: this.getHeaders(true),
    });
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
  }

  async getOrder(id: number): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      headers: this.getHeaders(true),
    });
    if (!response.ok) throw new Error("Failed to fetch order");
    return response.json();
  }

  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
    return response.json();
  }

  async updateOrderStatus(id: number, status: string): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      body: JSON.stringify({ status } satisfies UpdateOrderStatusRequest),
    });
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
    return response.json();
  }
  // ── Feedback API ──────────────────────────────────────────────────────────

  async createFeedback(
    orderId: number,
    data: CreateFeedbackRequest,
  ): Promise<FeedbackResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/feedback/order/${orderId}`,
      {
        method: "POST",
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      const message = await this.extractErrorMessage(response);
      throw new Error(message);
    }
    return response.json();
  }

  async getFeedbackByOrderId(orderId: number): Promise<FeedbackResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/feedback/order/${orderId}`,
      {
        headers: this.getHeaders(true),
      },
    );
    if (!response.ok) throw new Error("Failed to fetch feedback");
    return response.json();
  }

  async feedbackExistsForOrder(orderId: number): Promise<boolean> {
    const response = await fetch(
      `${API_BASE_URL}/api/feedback/order/${orderId}/exists`,
      {
        headers: this.getHeaders(true),
      },
    );
    if (!response.ok) throw new Error("Failed to check feedback");
    return response.json();
  }

  async getAllFeedback(): Promise<FeedbackResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      headers: this.getHeaders(true),
    });
    if (!response.ok) throw new Error("Failed to fetch feedback");
    return response.json();
  }
}

export const apiService = new ApiService();
