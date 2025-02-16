import { UpsertPaloRequestDto } from "@common/dto/palo.dto";
import apiClient from "./Api";

export const upsertPalo = async (palo: UpsertPaloRequestDto) => {
  return apiClient.post("/palo", palo);
};
