import React from "react";

interface InputProps {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
}

export const TextInput: React.FC<InputProps> = ({ label, name, value, onChange, required }) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input
      type="text"
      id={name}
      name={name}
      value={value?.toString() || ""}
      onChange={onChange}
      required={required}
    />
  </div>
);

export const NumberInput: React.FC<InputProps> = ({ label, name, value, onChange, required }) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input
      type="number"
      id={name}
      name={name}
      value={value?.toString() || ""}
      onChange={onChange}
      required={required}
    />
  </div>
);

interface SelectProps {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | number)[];
  required?: boolean;
}

export const SelectInput: React.FC<SelectProps> = ({ label, name, value, onChange, options, required }) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <select id={name} name={name} value={value?.toString() || ""} onChange={onChange} required={required}>
      <option value="" disabled>Select {label}</option>
      {options.map((option) => (
        <option key={option.toString()} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

interface MultiInputProps {
  label: string;
  values: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export const MultiInput: React.FC<MultiInputProps> = ({ label, values, onChange, onAdd, onRemove }) => (
  <div className="form-group">
    <label>{label}</label>
    {values.map((value, index) => (
      <div key={index} className="multi-input-group">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(index, e.target.value)}
        />
        <button type="button" onClick={() => onRemove(index)}>Remove</button>
      </div>
    ))}
    <button type="button" onClick={onAdd}>Add More</button>
  </div>
);

interface DateInputProps {
    label: string;
    name: string;
    value: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
  }

export const DateInput: React.FC<DateInputProps> = ({ label, name, value, onChange, required }) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        type="date"
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
      />
    </div>
  );




  interface FileInputProps {
    name: string;
    onChange: (base64: string | null) => void;
  }
  
   export const FileInput: React.FC<FileInputProps> = ({ name, onChange }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
  
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string); // Send Base64 string to parent
        };
        reader.readAsDataURL(file);
      }
    };
  
    return (
      <input
        type="file"
        name={name}
        accept="audio/*"
        onChange={handleFileChange}
      />
    );
  };
  
  
