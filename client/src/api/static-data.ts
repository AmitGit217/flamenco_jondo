import apiClient from "./Api";

export const getStaticDataByType = async (type: string) => {
  const response = await apiClient.get(`/static-data/tableByType?type=${type}`);
  return response[type];
};
