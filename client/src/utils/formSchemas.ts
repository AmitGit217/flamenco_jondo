interface FormField {
  name: string;
  type: "text" | "date";
  label: string;
  required: boolean;
}

export const formSchemas: Record<string, FormField[]> = {
  palo: [
    { name: "name", type: "text", label: "Palo Name", required: true },
    { name: "origin", type: "text", label: "Origin", required: true },
    { name: "origin_date", type: "date", label: "Origin Date", required: true },
  ],
  estilo: [
    { name: "name", type: "text", label: "Estilo Name", required: true },
    { name: "tonality", type: "text", label: "Tonality", required: true },
    { name: "key", type: "text", label: "Key", required: true },
  ],
  // Add other models here...
};
