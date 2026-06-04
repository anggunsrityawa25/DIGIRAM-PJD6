// FILE: src/services/api.ts
// GANTI SELURUH ISI FILE INI

const BASE_URL =
  `${import.meta.env.VITE_API_URL}/api`;
 
function getToken(): string {
  return localStorage.getItem('digiram_token') ?? '';
}
 
function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}
 
export const hospitalApi = {
  getAll: async () => {
    const r = await fetch(`${BASE_URL}/hospitals`, { headers: authHeaders() });
    return r.json();
  },

  getById: async (id: number | string) => {
    const r = await fetch(`${BASE_URL}/hospitals/${id}`, { headers: authHeaders() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Gagal mengambil data faskes.');
    return data.data || data;
  },

  create: async (hospital: any) => {
    const r = await fetch(`${BASE_URL}/hospitals`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(hospital),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Gagal menambahkan faskes.');
    return data.data || data;
  },

  update: async (id: number | string, hospital: any) => {
    const r = await fetch(`${BASE_URL}/hospitals/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(hospital),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Gagal mengubah data faskes.');
    return data.data || data;
  },

  delete: async (id: number | string) => {
    const r = await fetch(`${BASE_URL}/hospitals/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Gagal menghapus faskes.');
    return data;
  },
};
 
export async function createAssessment(payload: object): Promise<any> {
  const res = await fetch(`${BASE_URL}/emram-assessment`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal membuat assessment.');
  return data;
}
 
export async function updateAssessment(id: number | string, payload: object): Promise<any> {
  const res = await fetch(`${BASE_URL}/emram-assessment/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memperbarui assessment.');
  return data;
}
 
export async function getAssessmentById(id: number | string): Promise<any> {
  const res = await fetch(`${BASE_URL}/emram-assessment/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data assessment.');
  return data.data;
}
 
export async function deleteAssessment(id: number | string): Promise<any> {
  const res = await fetch(`${BASE_URL}/emram-assessment/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghapus assessment.');
  return data;
}
 
export async function submitAssessment(id: number | string): Promise<any> {
  const res = await fetch(`${BASE_URL}/emram-assessment/${id}/submit`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengirim assessment ke Dinkes.');
  return data;
}
 
// Verifikasi oleh Dinkes — mendukung data 3 tahap
export interface VerifyPayload {
  status: 'reviewed' | 'rejected';
  verification_notes?: string;
  tinjau_keputusan?: string;
  tinjau_catatan?: string;
  pic_dinkes?: string;
  tanggal_kunjungan?: string;
  temuan_per_stage?: Record<number, string>;
  keputusan_per_stage?: Record<number, string>;
  catatan_kunjungan?: string;
  keputusan_akhir?: string;
  catatan_akhir?: string;
}
 
export async function verifyAssessment(
  id: number | string,
  status: 'reviewed' | 'rejected',
  verification_notes: string,
  extra?: Omit<VerifyPayload, 'status' | 'verification_notes'>
): Promise<any> {
  const payload: VerifyPayload = { status, verification_notes, ...extra };
  const res = await fetch(`${BASE_URL}/emram-assessment/${id}/verify`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal melakukan verifikasi.');
  return data;
}
 
export async function getAllAssessments(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/emram-assessment`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data assessment.');
  return data.data ?? [];
}
 
export async function getMyAssessments(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/emram-my-assessments`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data assessment.');
  return data.data ?? [];
}
 
export async function uploadEvidenceFile(
  assessmentId: string | number,
  indicatorId: string,
  file: File
): Promise<{ name: string; url: string; type: string; size: number }> {
  const formData = new FormData();
  formData.append('indicator_id', indicatorId);
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/emram-assessment/${assessmentId}/upload-evidence`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      // Note: Do NOT set Content-Type with FormData — browser sets it with boundary
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengunggah file bukti.');
  return data.data;
}

export async function getAssessmentEvidence(
  assessmentId: string | number
): Promise<Record<string, Array<{ name: string; url: string; type: string; size: number }>>> {
  const res = await fetch(`${BASE_URL}/emram-assessment/${assessmentId}/evidence`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil bukti.');
  return data.data ?? {};
}
// ═══════════════════════════════════════════════════════════════
// INSTRUMEN EMRAM API
// ═══════════════════════════════════════════════════════════════

export interface EmramIndicatorAPI {
  id: number;
  stage: number;
  indicator_code: string;
  text: string;
  bukti_hint: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface EmramStageAPI {
  stage: number;
  title: string;
  description: string | null;
  is_active: boolean;
  indicators: EmramIndicatorAPI[];
}

/** Ambil semua stage + indikator. activeOnly=true untuk RS. */
export async function getEmramInstrument(activeOnly = false): Promise<EmramStageAPI[]> {
  const url = `${BASE_URL}/emram-instrument${activeOnly ? '?active_only=1' : ''}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil instrumen EMRAM.');
  return data.data ?? [];
}

/** Tambah indikator baru (Dinkes). */
export async function createEmramIndicator(payload: {
  stage: number;
  indicator_code: string;
  text: string;
  bukti_hint?: string;
  sort_order?: number;
}): Promise<EmramIndicatorAPI> {
  const res = await fetch(`${BASE_URL}/emram-instrument/indicators`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menambah indikator.');
  return data.data;
}

/** Update indikator (Dinkes). */
export async function updateEmramIndicator(
  id: number,
  payload: Partial<{ text: string; bukti_hint: string; sort_order: number; is_active: boolean }>
): Promise<EmramIndicatorAPI> {
  const res = await fetch(`${BASE_URL}/emram-instrument/indicators/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengubah indikator.');
  return data.data;
}

/** Hapus indikator (Dinkes). */
export async function deleteEmramIndicator(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/emram-instrument/indicators/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghapus indikator.');
}

/** Update judul/deskripsi stage (Dinkes). */
export async function updateEmramStage(
  stage: number,
  payload: Partial<{ title: string; description: string; is_active: boolean }>
): Promise<void> {
  const res = await fetch(`${BASE_URL}/emram-instrument/stages/${stage}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengubah stage.');
}

/** Simpan urutan ulang indikator dalam satu stage (Dinkes). */
export async function reorderEmramIndicators(stage: number, order: number[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/emram-instrument/bulk-reorder`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ stage, order }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menyimpan urutan.');
}
