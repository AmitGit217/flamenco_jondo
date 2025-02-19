import apiClient from "./Api";

export const getStaticDataByType = async (type: string, query?: string) => {
  const response = await apiClient.get(
    `/static-data/tableByType?type=${type}&query=${query || ""}`
  );
  return response[type];
};
