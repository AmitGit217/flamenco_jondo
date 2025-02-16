// Common API functions
import { API_URL } from "./env";
import { user } from "@common/index";
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

export const validateToken = async (token: string): Promise<user> => {
  const response = await fetch(`${API_URL}/auth/validate-token`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
