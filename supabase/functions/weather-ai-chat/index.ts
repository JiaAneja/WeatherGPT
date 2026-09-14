// Supabase Edge Function: weather-ai-chat
// Secure server-side AI endpoint with strict meteorological grounding
// Deno runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
  language?: string;
  context: WeatherContext;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const {
      message,
      language = "en",
      context,
    } = (await req.json()) as RequestPayload;

    // Validate request
    if (!message || !context) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: message and context are required.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Supported languages
    const languageNames: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      gu: "Gujarati",
      mr: "Marathi",
      ta: "Tamil",
      bn: "Bengali",
      te: "Telugu",
      pa: "Punjabi",
      kn: "Kannada",
      ml: "Malayalam",
      ur: "Urdu",
      or: "Odia",
      as: "Assamese",
    };

    const selectedLanguage =
      languageNames[language] || "the same language as the user";

    // Strict meteorological grounding prompt
    const systemPrompt = `
You are WeatherGPT, an AI meteorological intelligence and disaster
decision-support assistant for India.

Your job is to explain VERIFIED WEATHER INFORMATION clearly and safely.

CRITICAL RULES:

1. NEVER invent weather values.
2. NEVER create temperatures, rainfall, wind speeds, AQI values,
   UV values, alerts, forecasts, or other meteorological data that
   are not present in the VERIFIED WEATHER CONTEXT.
3. Use ONLY the weather information provided in the context.
4. If the user asks for information that is not available in the context,
   clearly say that verified data for that specific parameter is
   currently unavailable.
5. Do not pretend that an estimate is an official observation.
6. Do not claim that information comes directly from IMD unless the
   provided context explicitly identifies IMD as the source.
7. Give practical and safe recommendations.
8. For severe weather situations, prioritize safety.
9. Explain WHY you selected the risk level using the available
   weather observations.
10. Do not exaggerate risk.
11. Do not provide fabricated future weather predictions.
12. If forecast information is available in forecast_summary or
    rain_probability, you may use it, but do not invent additional
    forecast values.

LANGUAGE RULE:

Respond in ${selectedLanguage}.

IMPORTANT:
Preserve the user's language, script, tone, and intent.

If the user asks in Hindi, answer in Hindi.
If the user asks in Gujarati, answer in Gujarati.
If the user asks in English, answer in English.

Do not unnecessarily translate the user's question.

RESPONSE FORMAT:

Return ONLY valid JSON.

The JSON must follow this structure:

{
  "answer": "Clear, friendly answer directly addressing the user's question.",
  "risk_level": "Low",
  "evidence": [
    "Specific verified observation supporting the answer"
  ],
  "actionable_recommendations": [
    "Specific practical recommendation"
  ],
  "why_explanation": "Explain why this conclusion was reached using the verified context.",
  "source": "Source from the provided context",
  "verified_at": "Verification time from the provided context"
}

The risk_level MUST be exactly one of:

Low
Moderate
High
Severe

Do not add Markdown outside the JSON.
`;

    // Read Gemini API key from secure Supabase secrets
    const apiKey =
      Deno.env.get("GEMINI_API_KEY") ||
      Deno.env.get("LLM_API_KEY");

    // ============================================================
    // GEMINI AI
    // ============================================================

    if (apiKey) {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" +
          apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: systemPrompt,
                  },
                  {
                    text:
                      "VERIFIED WEATHER CONTEXT:\n" +
                      JSON.stringify(context, null, 2) +
                      "\n\nUSER QUESTION:\n" +
                      message,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      const data = await response.json();

      const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      // Return Gemini response if successful
      if (response.ok && rawText) {
        try {
          // Validate that Gemini actually returned JSON
          const parsedResponse = JSON.parse(rawText);

          return new Response(JSON.stringify(parsedResponse), {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          });
        } catch {
          // If Gemini returned malformed JSON, continue to fallback
          console.error("Gemini returned invalid JSON:", rawText);
        }
      } else {
        console.error(
          "Gemini API request failed:",
          JSON.stringify(data)
        );
      }
    } else {
      console.error("GEMINI_API_KEY is not configured.");
    }

    // ============================================================
    // VERIFIED RULE-BASED FALLBACK
    // ============================================================

    const hasRedAlert =
      context.active_alerts?.some(
        (alert) => alert.severity.toUpperCase() === "RED"
      ) ?? false;

    const hasOrangeAlert =
      context.active_alerts?.some(
        (alert) => alert.severity.toUpperCase() === "ORANGE"
      ) ?? false;

    const calculatedRisk =
      context.rainfall > 30 || hasRedAlert
        ? "Severe"
        : context.rainfall > 10 ||
          context.wind_speed > 35 ||
          hasOrangeAlert
        ? "High"
        : context.rainfall > 2 ||
          context.temperature > 38 ||
          context.aqi > 150 ||
          (context.active_alerts?.length ?? 0) > 0
        ? "Moderate"
        : "Low";

    const rainfallStatement =
      context.rainfall > 0
        ? `Rainfall is recorded at ${context.rainfall} mm with relative humidity of ${context.humidity}%.`
        : "No immediate precipitation is recorded.";

    const alertStatement =
      context.active_alerts && context.active_alerts.length > 0
        ? ` Active alert: ${context.active_alerts[0].title}.`
        : "";

    const fallbackResponse = {
      answer:
        `Based on the verified weather information for ${context.location}, ` +
        `the current temperature is ${context.temperature}°C with ` +
        `${context.weather_condition.toLowerCase()} conditions. ` +
        rainfallStatement +
        alertStatement,

      risk_level: calculatedRisk,

      evidence: [
        `Temperature: ${context.temperature}°C (Feels like: ${
          context.feels_like ?? context.temperature
        }°C)`,
        `Rainfall: ${context.rainfall} mm`,
        `Humidity: ${context.humidity}%`,
        `Wind Speed: ${context.wind_speed} km/h`,
        `AQI: ${context.aqi}`,
        `UV Index: ${context.uv_index}`,
      ],

      actionable_recommendations: [
        context.rainfall > 5
          ? "Carry rain protection and avoid low-lying or waterlogged areas."
          : "Normal outdoor activities can be considered based on current conditions.",

        context.uv_index > 7
          ? "UV exposure is high; use sunscreen, sunglasses, and limit prolonged direct exposure."
          : "Normal precautions for sun exposure are sufficient.",

        context.aqi > 100
          ? "People sensitive to air pollution should consider reducing prolonged outdoor exposure."
          : "Air quality is not currently above the configured caution threshold.",
      ],

      why_explanation:
        `The ${calculatedRisk} risk level is based on the available verified ` +
        `observations including rainfall of ${context.rainfall} mm, ` +
        `wind speed of ${context.wind_speed} km/h, temperature of ` +
        `${context.temperature}°C, AQI of ${context.aqi}, and the presence ` +
        `of active weather alerts.`,

      source:
        context.source || "Verified meteorological data",

      verified_at: context.observed_at,
    };

    return new Response(JSON.stringify(fallbackResponse), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("weather-ai-chat error:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});