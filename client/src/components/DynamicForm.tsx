import React, { useState, useEffect } from "react";
import apiClient from "../api/Api";
import { formSchemas } from "../utils/formSchemas";

export interface FormData {
  id?: number;
  name: string;
  origin?: string;
  origin_date?: string;
  tonality?: string;
  key?: string;
  [key: string]: string | number | undefined;
}

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = record ? `/${model}/${record.id}` : `/${model}`;

    try {
      if (record) {
        await apiClient.patch(url, formData);
      } else {
        await apiClient.post(url, formData);
      }
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
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                required={field.required}
              />
            </div>
          ))}
          <button type="submit" className="save-button">Save</button>
          <button type="button" className="close-button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default DynamicForm;
