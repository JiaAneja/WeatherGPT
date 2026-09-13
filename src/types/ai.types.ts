export type LanguageCode =
  | 'en' | 'hi' | 'gu' | 'mr' | 'ta' | 'bn' | 'te'
  | 'pa' | 'kn' | 'ml' | 'ur' | 'or' | 'as';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  risk_level?: 'Low' | 'Moderate' | 'High' | 'Severe';
  evidence?: string[];
  actionable_recommendations?: string[];
  why_explanation?: string;
  source?: string;
  verified_at?: string;
  isStreaming?: boolean;
}

export interface StructuredAIResponse {
  answer: string;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Severe';
  evidence: string[];
  actionable_recommendations: string[];
  why_explanation: string;
  source: string;
  verified_at: string;
}
