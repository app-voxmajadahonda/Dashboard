export function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function listValue(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function optionalUrl(value: string) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    return value;
  }
}

export function safeFilename(filename: string) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
