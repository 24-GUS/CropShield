export type UserRole = 'farmer' | 'expert' | 'admin';
export type Language = 'en' | 'kn' | 'ml' | 'hi';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  language_pref: Language;
  state: string;
  district: string;
  specialization?: string;
  institution?: string;
  is_active: boolean;
  created_at: string;
}

export interface Farm {
  id: number;
  user_id: number;
  farm_name: string;
  location_name: string;
  area_acres: number;
  soil_type: string;
  irrigation_type: string;
  primary_crop: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface CropDisease {
  id: number;
  crop_id: number;
  disease_code: string;
  disease_name: string;
  scientific_name?: string;
  is_healthy: boolean;
  severity_level: 'None' | 'Low' | 'Moderate' | 'High' | 'Severe';
  symptoms: string;
  common_causes: string;
  environmental_conditions: string;
  prevention_methods: string;
  ipm_measures: string;
  recommended_treatment: string;
  safety_precautions: string;
  expert_references: string;
  translations?: Record<string, any>;
}

export interface Crop {
  id: number;
  name: string;
  scientific_name?: string;
  category: string;
  season: string;
  description?: string;
  is_supported_by_ai: boolean;
  icon: string;
  local_names?: Record<string, string>;
  diseases?: CropDisease[];
}

export interface ScanResult {
  success: boolean;
  status: string;
  scan_id?: number;
  image_url: string;
  crop_name?: string;
  crop_scientific_name?: string;
  disease_name?: string;
  disease_scientific_name?: string;
  is_healthy?: boolean;
  confidence?: number;
  confidence_pct?: number;
  confidence_level?: string;
  severity?: string;
  symptoms?: string;
  common_causes?: string;
  environmental_conditions?: string;
  ipm_measures?: string;
  recommended_treatment?: string;
  safety_precautions?: string;
  expert_references?: string;
  translations?: Record<string, any>;
  top3_predictions?: Array<{
    class_code: string;
    confidence: number;
    confidence_pct: number;
  }>;
  message?: string;
  requires_expert?: boolean;
  detected_crop?: string;
  selected_crop?: string;
  created_at?: string;
}

export interface ScanHistoryItem {
  id: number;
  crop_name: string;
  disease_name: string;
  scientific_name?: string;
  is_healthy: boolean;
  confidence: number;
  confidence_pct: number;
  severity: string;
  status: string;
  image_url: string;
  created_at: string;
  expert_verdict?: string;
  expert_notes?: string;
  expert_name?: string;
  farmer_feedback?: number;
}

export interface WeatherRiskFactor {
  crop_name: string;
  disease_name: string;
  risk_level: 'Low' | 'Moderate' | 'High';
  explanation: string;
  recommended_prophylaxis: string;
}

export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  temperature_c: number;
  humidity_pct: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  condition: string;
  overall_risk_level: 'Low' | 'Moderate' | 'High';
  risk_factors: WeatherRiskFactor[];
  forecast: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    rain_sum: number;
    rain_prob: number;
  }>;
  disclaimer: string;
  timestamp: string;
}

export interface OutbreakReport {
  id: number;
  user_id: number;
  crop_id: number;
  disease_id?: number;
  disease_name_custom?: string;
  description?: string;
  approx_latitude: number;
  approx_longitude: number;
  district: string;
  state: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Severe';
  affected_acres: number;
  is_verified: boolean;
  verified_by_expert_id?: number;
  created_at: string;
  crop_name?: string;
  disease_name?: string;
}

export interface Consultation {
  id: number;
  farmer_id: number;
  expert_id?: number;
  scan_id?: number;
  crop_name: string;
  subject: string;
  question: string;
  image_url?: string;
  answer?: string;
  status: 'pending' | 'answered' | 'closed';
  farmer_rating?: number;
  created_at: string;
  updated_at: string;
  farmer_name?: string;
  expert_name?: string;
}

export interface ModelMetrics {
  model_name: string;
  benchmark_accuracy: number;
  benchmark_top3_accuracy: number;
  field_accuracy: number;
  field_top3_accuracy: number;
  macro_avg_f1: number;
  weighted_avg_f1: number;
  classes: string[];
  per_class_metrics: Record<string, {
    precision: number;
    recall: number;
    f1_score: number;
    support: number;
  }>;
  confusion_matrix: number[][];
  evaluation_notes: string;
}
