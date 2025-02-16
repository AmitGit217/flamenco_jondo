import apiClient from "./Api";

export const login = async (email: string, password: string) => {
  return apiClient.post("/auth/login", { email, password });
};

export const validateToken = async (token: string) => {
  return apiClient.get("/auth/validate-token", token);
};
