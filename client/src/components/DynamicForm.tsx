import React, { useState, useEffect } from "react";
import apiClient from "../api/Api";
import { formSchemas } from "../utils/formSchemas";
import { UpsertArtistRequestDto } from "@common/dto/artist.dto";
import { UpsertPaloRequestDto } from "@common/dto/palo.dto";
import { UpsertEstiloRequestDto } from "@common/dto/estilo.dto";
import { UpsertLetraRequestDto } from "@common/dto/letra.dto";
import { UpsertCompasRequestDto } from "@common/dto/compas.dto";

export type FormData = (UpsertArtistRequestDto | UpsertCompasRequestDto | UpsertEstiloRequestDto | UpsertLetraRequestDto | UpsertPaloRequestDto) & {
  [key: string]: string | number | string[] | number[] | undefined;
};

interface DynamicFormProps {
  model: string;
  record?: FormData;
  onClose: () => void;
  onSuccess: () => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ model, record, onClose, onSuccess }) => {
  const schema = formSchemas[model] || [];
  const [formData, setFormData] = useState<FormData>({} as FormData);

  useEffect(() => {
    if (record) {
      setFormData(record);
    }
  }, [record]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
   
  if(e.target.type === "number") {
      setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = `/${model}/upsert`;

    try {
      const processedData = { ...formData };
      schema.forEach(field => {
        const value = processedData[field.name];
        if (field.processing === "array" && value) {
          processedData[field.name] = value.toString().split("-").map(Number);
        }
      });

      await apiClient.post(url, {
        ...processedData,
        user_create_id: JSON.parse(localStorage.getItem("user") || "{}").id,
        user_update_id: JSON.parse(localStorage.getItem("user") || "{}").id
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const getInputValue = (value: string | number | string[] | number[] | undefined): string => {
    if (Array.isArray(value)) {
      return value.join(',');
    }
    return value?.toString() || '';
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{record ? `Edit ${model}` : `Add ${model}`}</h2>
        <form onSubmit={handleSubmit}>
          {schema.map((field) => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={getInputValue(formData[field.name])}
                onChange={handleChange}
                required={field.required}
              />
            </div>
          ))}
          <button type="submit" className="save-button">Save</button>
          <button type="button" className="close-button" onClick={onClose}>X</button>
        </form>
      </div>
    </div>
  );
};

export default DynamicForm;
