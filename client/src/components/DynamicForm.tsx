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
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === "number" ? parseInt(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = `/${model}/upsert`;

    try {
      await apiClient.post(url, {
        ...formData,
        user_create_id: JSON.parse(localStorage.getItem("user") || "{}").id,
        user_update_id: JSON.parse(localStorage.getItem("user") || "{}").id,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{record ? `Edit ${model}` : `Add ${model}`}</h2>
        <form onSubmit={handleSubmit}>
          {schema.map((field) => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              {field.processing === "enum" && Array.isArray(field.options) ? (
              
                <select name={field.name} value={formData[field.name]?.toString() || ""} onChange={handleChange} required={field.required}>
                  <option value="" disabled>Select {field.label}</option>
                  {field.options.map((option: string) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]?.toString() || ""}
                  onChange={handleChange}
                  required={field.required}
                />
              )}
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
