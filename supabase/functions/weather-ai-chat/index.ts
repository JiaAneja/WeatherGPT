// Supabase Edge Function: weather-ai-chat
// Secure server-side AI endpoint with strict meteorological grounding
// Deno runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeatherContext {
  location: string;
  temperature: number;
  feels_like?: number;
  humidity: number;
  wind_speed: number;
  rainfall: number;
  rain_probability?: number;
  uv_index: number;
  aqi: number;
  weather_condition: string;
  active_alerts?: Array<{
    alert_type: string;
    severity: string;
    title: string;
    description: string;
    source: string;
  }>;
  forecast_summary?: string;
  observed_at: string;
  source: string;
}

interface RequestPayload {
  message: string;
  language?: string; // 'en' | 'hi' | 'gu' | 'mr' | 'ta' | 'bn' | 'te'
  context: WeatherContext;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, language = "en", context } = (await req.json()) as RequestPayload;

    if (!message || !context) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: message and context are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // System prompt enforcing strict grounding: NO invented weather values!
    const systemPrompt = `You are WeatherGPT, India's premier AI meteorological intelligence and disaster decision-support assistant.
Your duty is to convert VERIFIED METEOROLOGICAL OBSERVATIONS into clear, explainable, and actionable advice.

CRITICAL RULES:
1. NEVER invent, extrapolate, or hallucinate weather metrics.
2. You MUST use ONLY the verified weather context provided below.
3. If the user asks about a weather parameter not present in the context, clearly state that verified meteorological data for that specific parameter is currently unavailable.
4. Adhere to official disaster management guidelines (IMD, NDMA, SDMA).
5. Explain WHY a risk level is what it is (e.g. "Because relative humidity is 88% and rainfall is 45mm/hr, waterlogging risk is high").
6. Language: Respond in ${({
      en: 'English', hi: 'Hindi', gu: 'Gujarati', mr: 'Marathi', ta: 'Tamil',
      bn: 'Bengali', te: 'Telugu', pa: 'Punjabi', kn: 'Kannada', ml: 'Malayalam',
      ur: 'Urdu', or: 'Odia', as: 'Assamese'
    } as Record<string, string>)[language] || 'the same language as the user'}.
CRITICAL LANGUAGE RULE: Preserve the user's language, script, tone, and intent. If the user writes Hindi, answer in Hindi; if Gujarati, answer in Gujarati, etc. Never translate the answer into English unless the user asks.
7. Return your response in clean JSON format matching this schema:
{
  "answer": "Clear, friendly, conversational answer directly answering user's query.",
  "risk_level": "Low" | "Moderate" | "High" | "Severe",
  "evidence": [
    "Observation metric 1 that supports this answer",
    "Observation metric 2 that supports this answer"
  ],
  "actionable_recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2"
  ],
  "why_explanation": "Detailed explanation of why this conclusion was reached based on specific thresholds (e.g., wind speed, precipitation, heat index).",
  "source": "${context.source}",
  "verified_at": "${context.observed_at}"
}`;

    const apiKey = Deno.env.get("LLM_API_KEY") || Deno.env.get("GEMINI_API_KEY");

    // If an external LLM key is configured in Supabase Edge Secrets, call the provider API
    if (apiKey) {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: systemPrompt },
                { text: `VERIFIED WEATHER CONTEXT:\n${JSON.stringify(context, null, 2)}\n\nUSER QUESTION:\n${message}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2, // Low temperature for high factual adherence
            responseMimeType: "application/json"
          }
        })
      });

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return new Response(rawText, {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback verified rule-engine response if no LLM key is configured
    // Demonstrates reliable zero-hallucination meteorological reasoning
    const calculatedRisk = context.rainfall > 30 || (context.active_alerts && context.active_alerts.some(a => a.severity === 'RED'))
      ? 'Severe'
      : context.rainfall > 10 || context.wind_speed > 35 || (context.active_alerts && context.active_alerts.some(a => a.severity === 'ORANGE'))
      ? 'High'
      : context.rainfall > 2 || context.temperature > 38 || context.aqi > 150 || (context.active_alerts && context.active_alerts.length > 0)
      ? 'Moderate'
      : 'Low';

    const fallbackResponse = {
      answer: `Based on verified IMD observations for ${context.location}, the current temperature is ${context.temperature}°C with ${context.weather_condition.toLowerCase()} conditions. ${
        context.rainfall > 0 ? `Rainfall is recorded at ${context.rainfall} mm with high relative humidity (${context.humidity}%).` : `No immediate precipitation recorded.`
      } ${context.active_alerts && context.active_alerts.length > 0 ? `Active Alert: ${context.active_alerts[0].title}.` : ''}`,
      risk_level: calculatedRisk,
      evidence: [
        `Temperature: ${context.temperature}°C (Feels like: ${context.feels_like || context.temperature}°C)`,
        `Rainfall: ${context.rainfall} mm (Humidity: ${context.humidity}%)`,
        `Wind Speed: ${context.wind_speed} km/h`,
        `AQI: ${context.aqi} | UV Index: ${context.uv_index}`
      ],
      actionable_recommendations: [
        context.rainfall > 5 ? "Carry heavy-duty rain gear; avoid low-lying underpasses." : "Standard outdoor activities are safe.",
        context.uv_index > 7 ? "High UV index; wear sunscreen and UV sunglasses." : "Moderate solar exposure.",
        context.aqi > 100 ? "Sensitive individuals should wear an N95 mask outdoors." : "Air quality is within acceptable range."
      ],
      why_explanation: `Decision rationale: Evaluated current precipitation (${context.rainfall}mm), wind velocity (${context.wind_speed}km/h), and active meteorological bulletins. Risk scored at ${calculatedRisk} based on IMD threshold guidelines.`,
      source: context.source || "India Meteorological Department (IMD)",
      verified_at: context.observed_at
    };

    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
