import apiClient from "./Api";

export const login = async (email: string, password: string) => {
  return apiClient.post("/auth/login", { email, password });
};

export const validateToken = async () => {
  return apiClient.get("/auth/validate-token").then((res) => {
    localStorage.setItem("user", JSON.stringify(res));
    return res;
  });
};
