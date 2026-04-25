import axios from 'axios';
type ValidationErrorBody = {
  message?: string;
  errors?: Record<string, string>;
};
type ErrorBody = {
  message?: string;
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
export function getApiErrorMessage(error: unknown, fallbackMessage = 'Request failed'): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) return error.message;
    return fallbackMessage;
  }
  const data = error.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (isRecord(data)) {
    const maybeMessage = (data as ErrorBody).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;
    const maybeErrors = (data as ValidationErrorBody).errors;
    if (maybeErrors && typeof maybeErrors === 'object') {
      const first = Object.values(maybeErrors).find((v) => typeof v === 'string' && v.trim());
      if (typeof first === 'string') return first;
    }
  }
  if (error.message) return error.message;
  return fallbackMessage;
}
