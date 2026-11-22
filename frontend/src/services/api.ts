const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && (window.location.port === '8000' || !window.location.port)
    ? '/api/v1'
    : 'http://127.0.0.1:8000/api/v1'
);

export const getAuthToken = (): string | null => {
  return localStorage.getItem('cropshield_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('cropshield_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('cropshield_token');
  localStorage.removeItem('cropshield_user');
};

export const resolveImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const clean = url.startsWith('/') ? url : `/${url}`;
  const backendBase = import.meta.env.VITE_BACKEND_URL || (
    typeof window !== 'undefined' && (window.location.port === '8000' || !window.location.port)
      ? ''
      : 'http://127.0.0.1:8000'
  );
  return `${backendBase}${clean}`;
};

const getHeaders = (isMultipart: boolean = false): HeadersInit => {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isMultipart: boolean = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(isMultipart),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// ----------------- AUTH API -----------------
export const authApi = {
  login: (data: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  demoLogin: (role: 'farmer' | 'expert' | 'admin') => apiRequest(`/auth/demo-login/${role}`),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (data: any) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// ----------------- CROPS & DISEASES API -----------------
export const cropsApi = {
  getAllCrops: () => apiRequest<any[]>('/crops'),
  getCropById: (id: number) => apiRequest<any>(`/crops/${id}`),
  getAllDiseases: (params?: { crop_name?: string; severity?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.crop_name && params.crop_name !== 'undefined' && params.crop_name.trim()) {
      searchParams.append('crop_name', params.crop_name.trim());
    }
    if (params?.severity && params.severity !== 'undefined' && params.severity.trim()) {
      searchParams.append('severity', params.severity.trim());
    }
    if (params?.search && params.search !== 'undefined' && params.search.trim()) {
      searchParams.append('search', params.search.trim());
    }
    const q = searchParams.toString();
    return apiRequest<any[]>(`/crops/diseases/all${q ? `?${q}` : ''}`);
  },
  getDiseaseById: (id: number) => apiRequest<any>(`/crops/diseases/${id}`),
  getFarms: () => apiRequest<any[]>('/crops/farms'),
  createFarm: (data: any) => apiRequest('/crops/farms', { method: 'POST', body: JSON.stringify(data) }),
};

// ----------------- SCANS API -----------------
export const scansApi = {
  analyzeImage: (cropId: number, imageFile: File, weatherContext?: any) => {
    const formData = new FormData();
    formData.append('crop_id', cropId.toString());
    formData.append('image', imageFile);
    if (weatherContext) {
      formData.append('weather_json', JSON.stringify(weatherContext));
    }
    return apiRequest<any>('/scans/analyze', { method: 'POST', body: formData }, true);
  },
  getHistory: (limit: number = 50) => apiRequest<any[]>(`/scans/history?limit=${limit}`),
  getDetail: (scanId: number) => apiRequest<any>(`/scans/${scanId}`),
  submitFeedback: (scanId: number, rating: number) =>
    apiRequest(`/scans/${scanId}/feedback`, { method: 'POST', body: JSON.stringify({ rating }) }),
  verifyScan: (scanId: number, data: { verdict: string; notes: string; corrected_disease_id?: number }) =>
    apiRequest(`/scans/${scanId}/verify`, { method: 'POST', body: JSON.stringify({ scan_id: scanId, ...data }) }),
};

// ----------------- WEATHER API -----------------
export const weatherApi = {
  getCurrent: (lat: number = 13.9299, lng: number = 75.5681, location: string = 'Shivamogga, Karnataka') =>
    apiRequest<any>(`/weather/current?lat=${lat}&lng=${lng}&location_name=${encodeURIComponent(location)}`),
  getRegions: () => apiRequest<any[]>('/weather/regions'),
};

// ----------------- OUTBREAK MAP API -----------------
export const outbreakApi = {
  getReports: (cropName?: string, verifiedOnly?: boolean) => {
    const params = new URLSearchParams();
    if (cropName) params.append('crop_name', cropName);
    if (verifiedOnly) params.append('verified_only', 'true');
    return apiRequest<any[]>(`/outbreaks?${params.toString()}`);
  },
  createReport: (data: any) => apiRequest('/outbreaks', { method: 'POST', body: JSON.stringify(data) }),
  verifyReport: (reportId: number) => apiRequest(`/outbreaks/${reportId}/verify`, { method: 'POST' }),
};

// ----------------- CONSULTATIONS API -----------------
export const consultationApi = {
  getAll: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return apiRequest<any[]>(`/consultations${q}`);
  },
  create: (data: { crop_name: string; subject: string; question: string; scan_id?: number }) =>
    apiRequest('/consultations', { method: 'POST', body: JSON.stringify(data) }),
  answer: (id: number, answer: string) =>
    apiRequest(`/consultations/${id}/answer`, { method: 'POST', body: JSON.stringify({ answer }) }),
  rate: (id: number, rating: number) =>
    apiRequest(`/consultations/${id}/rate?rating=${rating}`, { method: 'POST' }),
};

// ----------------- ANALYTICS & METRICS API -----------------
export const analyticsApi = {
  getFarmerSummary: () => apiRequest<any>('/analytics/farmer-summary'),
  getExpertSummary: () => apiRequest<any>('/analytics/expert-summary'),
  getAdminSummary: () => apiRequest<any>('/analytics/admin-summary'),
  getModelPerformance: () => apiRequest<any>('/analytics/model-performance'),
};

// ----------------- VOICE ASSISTANT API -----------------
export const voiceApi = {
  query: (question: string, language: string) =>
    apiRequest<any>('/voice/query', { method: 'POST', body: JSON.stringify({ question, language }) }),
};
