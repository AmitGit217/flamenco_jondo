import React, { useState, useEffect } from "react";
import apiClient from "../api/Api";
import { formSchemas } from "../utils/formSchemas";
import { UpsertArtistRequestDto } from "@common/dto/artist.dto";
import { UpsertPaloRequestDto } from "@common/dto/palo.dto";
import { UpsertEstiloRequestDto } from "@common/dto/estilo.dto";
import { UpsertLetraRequestDto } from "@common/dto/letra.dto";
import { UpsertCompasRequestDto } from "@common/dto/compas.dto";
import { TextInput, NumberInput, SelectInput, MultiInput, DateInput, FileInput } from "./Input";

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
  
    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0];
  
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, [name]: reader.result as string })); // Store as Base64
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === "number" ? parseInt(value) : value }));
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
  
    try {
      await apiClient.post(`/${model}/upsert`, {
        ...formData,
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
              {field.type === "file" ? (
                <FileInput
                  name={field.name}
                  onChange={(file: string | null) => {
                    if (file) setFormData(prev => ({ ...prev, [field.name]: file }));
                  }}
                />
              ) : field.processing === "enum" ? (
                <SelectInput 
                  label={field.label} 
                  name={field.name} 
                  value={formData[field.name] as string | number | undefined} 
                  onChange={handleChange} 
                  options={field.options || []} 
                  required={field.required} 
                />
              ) : field.processing === "multi-input" ? (
                <MultiInput
                  label={field.label}
                  values={(formData[field.name] as string[]) || []}
                  onChange={(index, value) => handleArrayChange(field.name, index, value)}
                  onAdd={() => handleAddItem(field.name)}
                  onRemove={(index) => handleRemoveItem(field.name, index)}
                />
              ) : field.type === "number" ? (
                <NumberInput 
                  label={field.label} 
                  name={field.name} 
                  value={formData[field.name] as number | undefined} 
                  onChange={handleChange} 
                  required={field.required} 
                />
              ) : field.type === "date" ? (
                <DateInput
                  label={field.label}
                  name={field.name}
                  value={formData[field.name] as string | undefined}
                  onChange={handleChange}
                  required={field.required}
                />
              ) : (
                <TextInput 
                  label={field.label} 
                  name={field.name} 
                  value={formData[field.name] as string | undefined} 
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
