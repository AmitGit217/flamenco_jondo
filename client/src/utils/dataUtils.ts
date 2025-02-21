export const isDateString = (
  value: string | number | string[] | number[] | undefined
): boolean => {
  if (!value || Array.isArray(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};
