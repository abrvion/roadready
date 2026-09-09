export const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

export const parsePositiveInt = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

export const parseNonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

export const cleanText = (value, maxLength) => {
  const text = String(value ?? "").trim();
  return text.length <= maxLength ? text : null;
};
