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
    if (e.target.type === "number") {
      setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleArrayChange = (fieldName: string, index: number, value: string) => {
    const newArray = Array.isArray(formData[fieldName]) ? [...(formData[fieldName] as string[])] : [];
    newArray[index] = value;
    setFormData({ ...formData, [fieldName]: newArray });
  };

  const handleAddItem = (fieldName: string) => {
    const newArray = Array.isArray(formData[fieldName]) ? [...(formData[fieldName] as string[]), ""] : [""];
    setFormData({ ...formData, [fieldName]: newArray });
  };

  const handleRemoveItem = (fieldName: string, index: number) => {
    const newArray = Array.isArray(formData[fieldName]) ? [...(formData[fieldName] as string[])] : [];
    newArray.splice(index, 1);
    setFormData({ ...formData, [fieldName]: newArray });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = `/${model}/upsert`;

    try {
      const processedData = { ...formData };
      schema.forEach((field) => {
        const value = processedData[field.name];
        if (field.processing === "array" && value) {
          processedData[field.name] = value.toString().split("-").map(Number);
        }
        if (field.processing === "array-string" && value) {
          processedData[field.name] = value.toString().split("-");
        }
      });

      await apiClient.post(url, {
        ...processedData,
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

              {field.processing === "multi-input" ? (
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
