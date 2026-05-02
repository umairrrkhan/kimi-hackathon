const KIMI_API_URL = '/v1'

export type KimiAnalysisResult = {
  foodName: string
  description: string
  estimatedCalories: number
  estimatedCarbs: number
  estimatedProtein: number
  estimatedFat: number
  nutrients: string[]
  rawMarkdown: string
}

export type GeneticMarker = {
  gene: string
  name: string
  variant: string
  impact: string
  riskLevel: 'low' | 'moderate' | 'high'
}

export type GeneticAnalysisResult = {
  markers: GeneticMarker[]
  summary: string
  rawMarkdown: string
  overallRisk: 'low' | 'moderate' | 'high'
}

export async function analyzeFoodText(
  foodDescription: string,
  apiKey: string
): Promise<KimiAnalysisResult> {
  const key = apiKey || import.meta.env.VITE_KIMI_API_KEY
  if (!key) {
    throw new Error('Missing API key. Set VITE_KIMI_API_KEY in .env')
  }

  const response = await fetch(`${KIMI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2.6',
      thinking: { type: 'disabled' },
      messages: [
        {
          role: 'system',
          content:
            'You are a food identification AI. Given a food description, identify the food and return structured nutritional data. Always respond in valid JSON with exactly these fields: foodName (string), description (string, 1-2 sentences about the food), estimatedCalories (number, total kcal), estimatedCarbs (number, grams), estimatedProtein (number, grams), estimatedFat (number, grams), nutrients (array of strings, max 5 items). Do NOT wrap the JSON in markdown code fences or any other formatting.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Identify this food and estimate its nutritional values. Food: ${foodDescription}. Respond with JSON only.`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`Kimi API error (${response.status}): ${errBody || response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Kimi API returned empty response')
  }

  return parseKimiResponse(content)
}

export async function analyzeGeneticData(
  geneticDataText: string,
  apiKey: string
): Promise<GeneticAnalysisResult> {
  const key = apiKey || import.meta.env.VITE_KIMI_API_KEY
  if (!key) {
    throw new Error('Missing API key. Set VITE_KIMI_API_KEY in .env')
  }

  const sample = geneticDataText.slice(0, 3000)

  const response = await fetch(`${KIMI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2.6',
      thinking: { type: 'disabled' },
      messages: [
        {
          role: 'system',
          content:
            'You are a genetics AI. Analyze raw genetic data (23andMe format) and return structured JSON. Focus on these food/metabolism-related genes: FTO (rs9939609), APOE (rs429358, rs7412), TCF7L2 (rs7903146), PPARG (rs1801282), MTHFR (rs1801133), and any other clinically relevant variants found. Always respond in valid JSON with exactly this structure: { "markers": [{ "gene": string, "name": string, "variant": string, "impact": string, "riskLevel": "low"|"moderate"|"high" }], "summary": string (2-3 sentence biological summary), "overallRisk": "low"|"moderate"|"high" }. Do NOT wrap the JSON in markdown code fences.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this raw genetic data and identify food/metabolism-related variants. Genetic data: ${sample}. Respond with JSON only.`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`Kimi API error (${response.status}): ${errBody || response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Kimi API returned empty response')
  }

  return parseGeneticResponse(content)
}

export async function analyzeFoodImage(
  imageBase64: string,
  apiKey: string
): Promise<KimiAnalysisResult> {
  const key = apiKey || import.meta.env.VITE_KIMI_API_KEY
  if (!key) {
    throw new Error('Missing API key. Set VITE_KIMI_API_KEY in .env')
  }

  const response = await fetch(`${KIMI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2.6',
      thinking: { type: 'disabled' },
      messages: [
        {
          role: 'system',
          content:
            'You are a food identification AI. Identify food from images and return structured nutritional data. Always respond in valid JSON with exactly these fields: foodName (string), description (string, 1-2 sentences about the food), estimatedCalories (number), estimatedCarbs (number, grams), estimatedProtein (number, grams), estimatedFat (number, grams), nutrients (array of strings, max 5 items). Do NOT wrap the JSON in markdown code fences or any other formatting.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageBase64 },
            },
            {
              type: 'text',
              text: 'Identify this food item and estimate its nutritional values. Respond with JSON only.',
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`Kimi API error (${response.status}): ${errBody || response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Kimi API returned empty response')
  }

  return parseKimiResponse(content)
}

function parseKimiResponse(content: string): KimiAnalysisResult {
  let cleaned = content.trim()

  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    return {
      foodName: parsed.foodName || 'Unknown Food',
      description: parsed.description || cleaned.slice(0, 500),
      estimatedCalories: typeof parsed.estimatedCalories === 'number' ? Math.round(parsed.estimatedCalories) : 0,
      estimatedCarbs: typeof parsed.estimatedCarbs === 'number' ? Math.round(parsed.estimatedCarbs) : 0,
      estimatedProtein: typeof parsed.estimatedProtein === 'number' ? Math.round(parsed.estimatedProtein) : 0,
      estimatedFat: typeof parsed.estimatedFat === 'number' ? Math.round(parsed.estimatedFat) : 0,
      nutrients: Array.isArray(parsed.nutrients) ? parsed.nutrients.slice(0, 5) : [],
      rawMarkdown: content,
    }
  } catch {
    const braceMatch = cleaned.match(/\{[\s\S]*\}/)
    if (braceMatch) {
      try {
        const parsed = JSON.parse(braceMatch[0])
        return {
          foodName: parsed.foodName || 'Unknown Food',
          description: parsed.description || cleaned.slice(0, 500),
          estimatedCalories: typeof parsed.estimatedCalories === 'number' ? Math.round(parsed.estimatedCalories) : 0,
          estimatedCarbs: typeof parsed.estimatedCarbs === 'number' ? Math.round(parsed.estimatedCarbs) : 0,
          estimatedProtein: typeof parsed.estimatedProtein === 'number' ? Math.round(parsed.estimatedProtein) : 0,
          estimatedFat: typeof parsed.estimatedFat === 'number' ? Math.round(parsed.estimatedFat) : 0,
          nutrients: Array.isArray(parsed.nutrients) ? parsed.nutrients.slice(0, 5) : [],
          rawMarkdown: content,
        }
      } catch {}
    }

    return {
      foodName: extractValue(cleaned, 'food', 'name') || 'Unknown Food',
      description: cleaned.slice(0, 500),
      estimatedCalories: parseInt(extractValue(cleaned, 'calories', 'kcal') || '0') || 0,
      estimatedCarbs: parseInt(extractValue(cleaned, 'carbs', 'carb') || '0') || 0,
      estimatedProtein: parseInt(extractValue(cleaned, 'protein', 'protein') || '0') || 0,
      estimatedFat: parseInt(extractValue(cleaned, 'fat', 'fat') || '0') || 0,
      nutrients: extractList(cleaned, 'nutrient'),
      rawMarkdown: content,
    }
  }
}

function parseGeneticResponse(content: string): GeneticAnalysisResult {
  let cleaned = content.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    return {
      markers: Array.isArray(parsed.markers)
        ? parsed.markers.map((m: GeneticMarker) => ({
            gene: m.gene || 'Unknown',
            name: m.name || '',
            variant: m.variant || '',
            impact: m.impact || '',
            riskLevel: m.riskLevel || 'moderate',
          }))
        : [],
      summary: parsed.summary || '',
      rawMarkdown: content,
      overallRisk: parsed.overallRisk || 'moderate',
    }
  } catch {
    const braceMatch = cleaned.match(/\{[\s\S]*\}/)
    if (braceMatch) {
      try {
        const parsed = JSON.parse(braceMatch[0])
        return {
          markers: Array.isArray(parsed.markers)
            ? parsed.markers.map((m: GeneticMarker) => ({
                gene: m.gene || 'Unknown',
                name: m.name || '',
                variant: m.variant || '',
                impact: m.impact || '',
                riskLevel: m.riskLevel || 'moderate',
              }))
            : [],
          summary: parsed.summary || '',
          rawMarkdown: content,
          overallRisk: parsed.overallRisk || 'moderate',
        }
      } catch {}
    }
    return {
      markers: [],
      summary: 'Could not parse genetic data.',
      rawMarkdown: content,
      overallRisk: 'moderate',
    }
  }
}

function extractValue(text: string, ...keywords: string[]): string | null {
  const lines = text.split('\n')
  for (const line of lines) {
    const lowered = line.toLowerCase()
    if (keywords.some((k) => lowered.includes(k))) {
      const match = line.match(/(?::|≈|~|be\s*)\s*([\d,.]+)\s*(g|kcal|mg|%)?/i)
      if (match) return match[1].replace(/,/g, '')
    }
  }
  return null
}

function extractList(text: string, keyword: string): string[] {
  const results: string[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.toLowerCase().includes(keyword)) {
      const items = line.split(/[,•\-;]/).map((s) => s.trim()).filter(Boolean)
      results.push(...items)
    }
  }
  return results.slice(0, 5)
}
