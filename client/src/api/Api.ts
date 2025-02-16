import { API_URL } from "./env";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, method: string, data?: T) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

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

  public get(endpoint: string) {
    return this.request(endpoint, "GET", null);
  }

  public post<T>(endpoint: string, data: T) {
    return this.request<T>(endpoint, "POST", data);
  }

  public patch<T>(endpoint: string, data: T) {
    return this.request<T>(endpoint, "PATCH", data);
  }

  public delete(endpoint: string) {
    return this.request(endpoint, "DELETE", null);
  }
}

// Create a singleton instance
const apiClient = new ApiClient(API_URL);

export default apiClient;
