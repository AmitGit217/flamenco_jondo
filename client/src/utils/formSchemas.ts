interface FormField {
  name: string;
  type: "text" | "date" | "number";
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
    { name: "palo_id", type: "number", label: "Palo ID", required: true },
  ],
  letra: [
    { name: "verses", type: "text", label: "Verses", required: true },
    {
      name: "rhyme_scheme",
      type: "text",
      label: "Rhyme Scheme",
      required: true,
    },
    {
      name: "repetition_pattern",
      type: "text",
      label: "Repetition Pattern",
      required: true,
    },
    { name: "structure", type: "text", label: "Structure", required: true },
    { name: "estilo_id", type: "number", label: "Estilo ID", required: true },
  ],
  compas: [
    { name: "name", type: "text", label: "Compas Name", required: true },
    { name: "origin", type: "text", label: "Origin", required: true },
    { name: "origin_date", type: "date", label: "Origin Date", required: true },
  ],
  artista: [
    { name: "name", type: "text", label: "Artista Name", required: true },
    { name: "origin", type: "text", label: "Origin", required: true },
    { name: "origin_date", type: "date", label: "Origin Date", required: true },
  ],
  artist: [
    { name: "name", type: "text", label: "Artist Name", required: true },
    { name: "type", type: "text", label: "Artist Type", required: true },
  ],
};
