// Common API functions
import { API_URL } from "./env";
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" }, // Ensures proper JSON request
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};
