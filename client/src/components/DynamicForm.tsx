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

  // Handle changes for multi-input fields
  const handleArrayChange = (fieldName: string, index: number, value: string) => {
    const newArray = Array.isArray(formData[fieldName]) ? [...(formData[fieldName] as string[])] : [];
    newArray[index] = value;
    setFormData({ ...formData, [fieldName]: newArray });
  };

  // Add new input to multi-input fields
  const handleAddItem = (fieldName: string) => {
    const newArray = Array.isArray(formData[fieldName]) ? [...(formData[fieldName] as string[]), ""] : [""];
    setFormData({ ...formData, [fieldName]: newArray });
  };

  // Remove input from multi-input fields
  const handleRemoveItem = (fieldName: string, index: number) => {
    const newArray = Array.isArray(formData[fieldName]) ? [...(formData[fieldName] as string[])] : [];
    newArray.splice(index, 1);
    setFormData({ ...formData, [fieldName]: newArray });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = { ...formData };

    schema.forEach((field) => {
        const value = processedData[field.name];

        if (field.processing === "array" && typeof value === "string") {
            processedData[field.name] = value.split("-").map((v) => Number(v.trim()));
        }

        if (field.processing === "array-string" && typeof value === "string") {
            processedData[field.name] = value.split("-");
        }
    });

    try {
        await apiClient.post(`/${model}/upsert`, {
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

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{record ? `Edit ${model}` : `Add ${model}`}</h2>
        <form onSubmit={handleSubmit}>
          {schema.map((field) => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>

              {field.processing === "enum" && Array.isArray(field.options) ? (
                // Dropdown for Enum Fields
                <select 
                  name={field.name} 
                  value={Array.isArray(formData[field.name]) 
                    ? (formData[field.name] as (string | number)[]).join(',') 
                    : formData[field.name]?.toString() || ""
                  } 
                  onChange={handleChange} 
                  required={field.required}
                >
                  <option value="" disabled>Select {field.label}</option>
                  {field.options.map((option: string) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.processing === "multi-input" ? (
                // Multi-Input Array Fields
                <div>
                  {(formData[field.name] as string[] || []).map((value, index) => (
                    <div key={index} className="array-input-group">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleArrayChange(field.name, index, e.target.value)}
                      />
                      <button type="button" onClick={() => handleRemoveItem(field.name, index)}>Remove</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddItem(field.name)}>Add More</button>
                </div>
              ) : (
                // Standard Input Fields
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
