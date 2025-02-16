import { API_URL } from "./env";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    data?: T,
    token?: string
  ) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) }),
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  public get(endpoint: string, token?: string) {
    return this.request(endpoint, "GET", null, token);
  }

  public post<T>(endpoint: string, data: T, token?: string) {
    return this.request<T>(endpoint, "POST", data, token);
  }

  public patch<T>(endpoint: string, data: T, token?: string) {
    return this.request<T>(endpoint, "PATCH", data, token);
  }

  public delete(endpoint: string, token?: string) {
    return this.request(endpoint, "DELETE", null, token);
  }
}

// Create a singleton instance
const apiClient = new ApiClient(API_URL);

export default apiClient;
