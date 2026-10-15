import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
export const isAiEnabled = Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY');

if (isAiEnabled) {
  console.log('[AI] Gemini Vision API: ENABLED');
} else {
  console.log('[AI] Gemini Vision API: MANUAL FALLBACK (No valid GEMINI_API_KEY found)');
}

const ai = isAiEnabled
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    })
  : null;

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export interface PhotoAnalysisResult {
  source: 'gemini' | 'unavailable';
  reason?: string;
  materialType?: string;
  materialSubtype?: string;
  estimatedCondition?: 'Intact' | 'Minor Chipping' | 'Mixed Mortar' | 'Crushed/Rubble' | 'Heavily Damaged';
  confidence?: number;
  visibleObservations?: string[];
  suggestedUnit?: string;
  warnings?: string[];
}

export interface MatchExplanationResult {
  source: 'gemini' | 'unavailable';
  reason?: string;
  plainSummary?: string;
  strengths?: string[];
  cautions?: string[];
  recommendation?: string;
}

export async function analyzePhotosWithGemini(
  base64Images: Array<{ mimeType: string; data: string }>,
  context?: string
): Promise<PhotoAnalysisResult> {
  if (!isAiEnabled || !ai) {
    return {
      source: 'unavailable',
      reason: 'AI vision service is not configured. Please use manual entry.'
    };
  }

  if (!base64Images || base64Images.length === 0) {
    return {
      source: 'unavailable',
      reason: 'No images provided for analysis.'
    };
  }

  try {
    // 8-second timeout enforcement
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out after 8 seconds')), 8000)
    );

    const callPromise = (async () => {
      const parts: any[] = base64Images.slice(0, 6).map(img => ({
        inlineData: {
          mimeType: img.mimeType || 'image/jpeg',
          data: img.data.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '')
        }
      }));

      parts.push({
        text: `You are an expert construction & demolition (C&D) material recovery engineer in Hyderabad, India.
Analyze these photos of recovered C&D materials.
Context: ${context || 'Recovery batch listing'}.

Provide a structured objective JSON assessment:
- materialType: one of ["Clay Bricks", "Concrete Blocks", "Fly Ash Bricks", "Granite & Stone Rubble", "Recycled Concrete Aggregate (RCA)", "Rebar & Steel Sections", "Timber & Wood Scantlings", "Ceramic Tiles", "Other"]
- materialSubtype: specific subtype (e.g., "Wire-cut Red Clay Bricks", "M20 Broken Concrete Curbing", "Structural TMT Bars")
- estimatedCondition: one of ["Intact", "Minor Chipping", "Mixed Mortar", "Crushed/Rubble", "Heavily Damaged"]
- confidence: integer percentage (0 to 100) based strictly on visual clarity
- visibleObservations: array of 2-4 factual visual observations (e.g., "Adhered lime mortar on ~30% surface", "Clean edges, minimal spalling", "Stacked on wooden pallets")
- suggestedUnit: one of ["Pieces", "Tons", "Cubic Meters", "Sq.Ft"]
- warnings: array of any visible contamination, embedded nails, moisture discoloration, or structural cracks

Motto: "AI suggests, the engine decides, people confirm."
DO NOT certify or guarantee structural safety. Only report what is visually seen.`
      });

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              materialType: { type: Type.STRING },
              materialSubtype: { type: Type.STRING },
              estimatedCondition: {
                type: Type.STRING,
                enum: ['Intact', 'Minor Chipping', 'Mixed Mortar', 'Crushed/Rubble', 'Heavily Damaged']
              },
              confidence: { type: Type.INTEGER },
              visibleObservations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedUnit: { type: Type.STRING },
              warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['materialType', 'materialSubtype', 'estimatedCondition', 'confidence', 'visibleObservations']
          }
        }
      });

      const text = response.text?.trim();
      if (!text) {
        throw new Error('Empty response from model');
      }

      const parsed = JSON.parse(text);
      return {
        source: 'gemini' as const,
        materialType: parsed.materialType,
        materialSubtype: parsed.materialSubtype,
        estimatedCondition: parsed.estimatedCondition,
        confidence: Math.min(100, Math.max(10, parsed.confidence || 75)),
        visibleObservations: parsed.visibleObservations || [],
        suggestedUnit: parsed.suggestedUnit || 'Pieces',
        warnings: parsed.warnings || []
      };
    })();

    return await Promise.race([callPromise, timeoutPromise]);
  } catch (error: any) {
    console.warn('[AI] Photo analysis failed or timed out:', error?.message || error);
    return {
      source: 'unavailable',
      reason: error?.message || 'AI reading unavailable. Continue with manual entry.'
    };
  }
}

export async function explainMatchWithGemini(matchData: any): Promise<MatchExplanationResult> {
  if (!isAiEnabled || !ai) {
    return {
      source: 'unavailable',
      reason: 'AI explanation service unavailable. Rely on deterministic engine score breakdown.'
    };
  }

  try {
    // 6-second timeout enforcement
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Match explanation timed out after 6 seconds')), 6000)
    );

    const callPromise = (async () => {
      const prompt = `You are a construction materials specialist explaining a deterministic match score between a recovered material batch and a buyer demand.
Here is the engine's score calculation (DO NOT change these numbers or scores):
Batch Material: ${matchData.batchMaterial} (${matchData.batchSubtype || ''})
Demand Material: ${matchData.demandMaterial} (${matchData.demandSubtype || ''})
Total Match Score: ${matchData.totalScore}/100 (Band: ${matchData.band})
Component Breakdown:
- Compatibility: ${matchData.components?.compatibility ?? 'N/A'}/25
- Quantity: ${matchData.components?.quantity ?? 'N/A'}/20
- Timing: ${matchData.components?.timing ?? 'N/A'}/15
- Distance (${matchData.roadDistanceKm ?? 'N/A'} km): ${matchData.components?.distance ?? 'N/A'}/15
- Evidence Level (${matchData.evidenceLevel ?? 'N/A'}): ${matchData.components?.evidence ?? 'N/A'}/10
- Economics (₹${matchData.netSaving ?? 0} saved): ${matchData.components?.economics ?? 'N/A'}/15
Hard Filter Flags: ${JSON.stringify(matchData.hardFilterReasons || [])}

Write a concise plain-language summary for an Indian site engineer or contractor:
- plainSummary: 2 short sentences explaining why this score was received.
- strengths: 2-3 key positive factors (e.g. "Low haulage distance within 8km", "Full quantity available immediately").
- cautions: 1-2 caveats or required checks (e.g. "Requires mortar brushing test", "Verify offloading crane access").
- recommendation: 1 clear actionable sentence.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plainSummary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              cautions: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendation: { type: Type.STRING }
            },
            required: ['plainSummary', 'strengths', 'cautions', 'recommendation']
          }
        }
      });

      const text = response.text?.trim();
      if (!text) throw new Error('Empty response from model');
      const parsed = JSON.parse(text);

      return {
        source: 'gemini' as const,
        plainSummary: parsed.plainSummary,
        strengths: parsed.strengths || [],
        cautions: parsed.cautions || [],
        recommendation: parsed.recommendation
      };
    })();

    return await Promise.race([callPromise, timeoutPromise]);
  } catch (error: any) {
    console.warn('[AI] Explain match failed or timed out:', error?.message || error);
    return {
      source: 'unavailable',
      reason: error?.message || 'AI explanation unavailable.'
    };
  }
}
