import apiClient from "./Api";

export const getPalo = async (id: number) => {
  const response = await apiClient.get(`/palo/${id}`);
  return response;
};
