import apiClient from "./Api";

export const getStaticDataByType = async (type: string, query?: string) => {
  const response = await apiClient.get(
    `/static-data/tableByType?type=${type}&query=${query || ""}`
  );
  return response[type];
};

export const universalSearch = async (query: string) => {
  const response = await apiClient.get(
    `/static-data/universalSearch?query=${query}`
  );
  return response;
};

export const deleteRecord = async (model: string, id: number) => {
  const response = await apiClient.delete(`/${model}/${id}`);
  return response;
};
