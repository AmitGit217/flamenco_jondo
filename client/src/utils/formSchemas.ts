interface FormField {
  name: string;
  type: "text" | "date" | "number";
  label: string;
  required: boolean;
  processing?: "array" | "object" | "array-string" | "multi-input" | undefined;
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
    { name: "origin", type: "text", label: "Origin", required: true },
    { name: "origin_date", type: "date", label: "Origin Date", required: true },
    { name: "palo_id", type: "number", label: "Palo ID", required: false },
    { name: "artist_id", type: "number", label: "Artist ID", required: false },
  ],
  letra: [
    { name: "estilo_id", type: "number", label: "Estilo ID", required: false },
    {
      name: "verses",
      type: "text",
      label: "Verses",
      required: true,
      processing: "multi-input",
    },
    {
      name: "rhyme_scheme",
      type: "text",
      label: "Rhyme Scheme",
      required: true,
      processing: "array",
    },
    {
      name: "repetition_pattern",
      type: "text",
      label: "Repetition Pattern",
      required: true,
      processing: "array",
    },
    { name: "structure", type: "text", label: "Structure", required: true },
  ],
  compas: [
    { name: "name", type: "text", label: "Compas Name", required: true },
    { name: "beats", type: "number", label: "Beats", required: true },
    {
      name: "accents",
      type: "text",
      label: "Accents (comma-separated integers)",
      required: true,
      processing: "array",
    },
    {
      name: "silences",
      type: "text",
      label: "Silences (comma-separated integers)",
      required: true,
      processing: "array",
    },
    {
      name: "time_signatures",
      type: "text",
      label: "Time Signatures (comma-separated)",
      required: true,
      processing: "array-string",
    },
    { name: "bpm", type: "number", label: "BPM", required: true },
  ],
  artist: [
    { name: "name", type: "text", label: "Artist Name", required: true },
    {
      name: "birth_year",
      type: "number",
      label: "Birth Year",
      required: false,
    },
    {
      name: "death_year",
      type: "number",
      label: "Death Year",
      required: false,
    },
    { name: "origin", type: "text", label: "Origin", required: false },
    { name: "type", type: "text", label: "Artist Type", required: true },
  ],
  feedback: [
    { name: "user_id", type: "number", label: "User ID", required: false },
    { name: "comment", type: "text", label: "Comment", required: true },
    { name: "email", type: "text", label: "Email", required: true },
  ],
};
