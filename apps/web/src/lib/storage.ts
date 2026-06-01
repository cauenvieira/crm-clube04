const apiKeyStorageKey = "crm_api_key";

export function getStoredApiKey() {
  return localStorage.getItem(apiKeyStorageKey) ?? "";
}

export function setStoredApiKey(value: string) {
  const cleaned = value.trim();
  if (!cleaned) {
    localStorage.removeItem(apiKeyStorageKey);
    return;
  }
  localStorage.setItem(apiKeyStorageKey, cleaned);
}

export function clearStoredApiKey() {
  localStorage.removeItem(apiKeyStorageKey);
}
