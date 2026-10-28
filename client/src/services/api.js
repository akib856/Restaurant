const BASE = (import.meta.env.VITE_API_URL || '') + '/api/v1';
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method, credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(json.message || 'Request failed'); e.status = res.status; e.errors = json.errors; throw e; }
  return json;
}
// Sends the image file as the raw request body; returns the stored image URL.
export async function uploadImage(file) {
  const res = await fetch(BASE + '/admin/uploads', {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': file.type, 'X-Requested-With': 'XMLHttpRequest' },
    body: file,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(res.status === 413 ? 'Image is too large (max 5 MB)' : json.message || 'Upload failed');
  return json.data.url;
}
