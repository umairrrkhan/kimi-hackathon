import type { SimulationResult, UserProfile } from '../store/simulationStore'
import type { KimiAnalysisResult } from './kimiApi'

function gaussian(x: number, mean: number, std: number, amp: number): number {
  return amp * Math.exp(-0.5 * ((x - mean) / std) ** 2)
}

function sigmoid(x: number, midpoint: number, slope: number): number {
  return 1 / (1 + Math.exp(-slope * (x - midpoint)))
}

export function generateSimulation(
  foodName: string,
  profile: UserProfile | null,
  kimiAnalysis?: string,
  kimiData?: KimiAnalysisResult
): SimulationResult {
  const glycemicIndex = getGlycemicIndex(foodName, kimiData)
  const carbLoad = getCarbLoad(foodName, kimiData)
  const fatG = getFatGrams(foodName, kimiData)
  const fiberG = getFiberGrams(foodName, kimiData)

  const insulinSensitivity = profile
    ? calculateInsulinSensitivity(profile)
    : 1.0

  const geneticModifier = profile?.geneticMarkers?.length
    ? applyGeneticModifiers(profile.geneticMarkers)
    : 1.0

  const hours = 8
  const points = 80
  const dt = hours / points

  const glucose: { time: number; value: number }[] = []
  const insulin: { time: number; value: number }[] = []
  const cognitive: { time: number; focus: number; fog: number }[] = []

  const baseGlucose = profile?.hasDiabetes ? 140 : 85
  const peakGlucose = baseGlucose + glycemicIndex * 60 * carbLoad * geneticModifier
  const peakTime = 0.5 + fiberG * 0.3 + fatG * 0.05

  let glucoseVal = baseGlucose
  let insulinVal = 8

  for (let i = 0; i <= points; i++) {
    const t = i * dt

    const glucoseCurve =
      gaussian(t, peakTime, 0.6 + fiberG * 0.2, peakGlucose - baseGlucose) *
      insulinSensitivity *
      (1 + (1 - insulinSensitivity) * 0.3)

    glucoseVal = baseGlucose + glucoseCurve

    const insulinResponse =
      gaussian(t, peakTime + 0.3, 0.5, 40 * carbLoad) / insulinSensitivity
    insulinVal = 8 + insulinResponse

    glucose.push({ time: Math.round(t * 10) / 10, value: Math.round(glucoseVal) })
    insulin.push({ time: Math.round(t * 10) / 10, value: Math.round(insulinVal * 10) / 10 })
  }

  for (let i = 0; i <= points; i++) {
    const t = i * dt
    const gVal = glucose[i].value
    const focusBase = 100 - Math.max(0, (gVal - 100) * 0.4)
    const fogBase = Math.min(100, Math.max(0, (gVal - 140) * 0.8))

    const recovery = sigmoid(t, 3, 1.5)
    const focus = Math.min(100, Math.max(30, focusBase + (100 - focusBase) * recovery))
    const fog = Math.max(0, fogBase * (1 - recovery * 0.7))

    cognitive.push({
      time: Math.round(t * 10) / 10,
      focus: Math.round(focus),
      fog: Math.round(fog),
    })
  }

  const organStress = calculateOrganStress(foodName, profile, glycemicIndex, carbLoad)

  const prediction = generatePrediction(
    foodName,
    glucose,
    insulin,
    organStress,
    cognitive,
    profile,
    kimiAnalysis,
    geneticModifier,
    kimiData
  )

  return { glucose, insulin, organStress, cognitive, prediction }
}

function getGlycemicIndex(food: string, kimiData?: KimiAnalysisResult): number {
  const highGI = ['bread', 'rice', 'pasta', 'potato', 'sugar', 'candy', 'soda', 'cereal', 'bagel', 'waffle', 'pancake', 'donut', 'cake', 'cookie', 'chips', 'fries']
  const mediumGI = ['banana', 'mango', 'pineapple', 'popcorn', 'oatmeal', 'basmati', 'brown rice', 'sweet potato', 'corn', 'beetroot']
  const lowGI = ['apple', 'orange', 'grape', 'pear', 'berry', 'beans', 'lentil', 'chickpea', 'milk', 'yogurt', 'nuts', 'avocado', 'egg', 'meat', 'fish', 'tofu', 'broccoli', 'spinach', 'kale', 'tomato']

  const searchName = kimiData?.foodName || food
  const lowered = searchName.toLowerCase()
  if (highGI.some((f) => lowered.includes(f))) return 1.0
  if (mediumGI.some((f) => lowered.includes(f))) return 0.6
  if (lowGI.some((f) => lowered.includes(f))) return 0.3

  if (kimiData) {
    const carbs = kimiData.estimatedCarbs
    if (carbs > 60) return 0.9
    if (carbs > 30) return 0.6
    if (carbs < 10) return 0.3
  }

  return 0.5
}

function getCarbLoad(food: string, kimiData?: KimiAnalysisResult): number {
  if (kimiData) {
    return Math.min(1, Math.max(0.1, kimiData.estimatedCarbs / 100))
  }

  const high = ['pasta', 'rice', 'bread', 'potato', 'candy', 'sugar', 'cake', 'donut', 'cereal']
  const med = ['banana', 'mango', 'oatmeal', 'popcorn', 'sweet potato', 'corn', 'bagel']
  const low = ['egg', 'meat', 'fish', 'tofu', 'broccoli', 'spinach', 'kale', 'nuts', 'avocado', 'cheese']

  const lowered = food.toLowerCase()
  if (high.some((f) => lowered.includes(f))) return 1.0
  if (med.some((f) => lowered.includes(f))) return 0.6
  if (low.some((f) => lowered.includes(f))) return 0.2
  return 0.5
}

function getFatGrams(food: string, kimiData?: KimiAnalysisResult): number {
  if (kimiData) {
    return Math.min(1, Math.max(0.1, kimiData.estimatedFat / 50))
  }

  const high = ['burger', 'pizza', 'fries', 'bacon', 'butter', 'oil', 'cheese', 'cream', 'nuts', 'avocado', 'fried']
  const lowered = food.toLowerCase()
  if (high.some((f) => lowered.includes(f))) return 1.0
  return 0.3
}

function getFiberGrams(food: string, kimiData?: KimiAnalysisResult): number {
  if (kimiData?.nutrients) {
    const hasFiber = kimiData.nutrients.some((n) => n.toLowerCase().includes('fiber'))
    if (hasFiber) return 1.0
  }

  const high = ['bean', 'lentil', 'broccoli', 'spinach', 'kale', 'avocado', 'berry', 'oat', 'nut', 'seed']
  const lowered = food.toLowerCase()
  if (high.some((f) => lowered.includes(f))) return 1.0
  return 0.2
}

function calculateInsulinSensitivity(profile: UserProfile): number {
  let sensitivity = 1.0

  if (profile.age > 50) sensitivity -= 0.2
  else if (profile.age > 40) sensitivity -= 0.1

  if (profile.activityLevel === 'sedentary') sensitivity -= 0.2
  else if (profile.activityLevel === 'moderate') sensitivity -= 0.05

  if (profile.hasDiabetes) sensitivity -= 0.4

  const bmi = profile.weight / ((profile.height / 100) ** 2)
  if (bmi > 30) sensitivity -= 0.2
  else if (bmi > 25) sensitivity -= 0.1

  if (profile.sleepHours < 6) sensitivity -= 0.1

  return Math.max(0.3, sensitivity)
}

function applyGeneticModifiers(markers: { gene: string; variant: string }[]): number {
  let modifier = 1.0

  for (const m of markers) {
    const gene = m.gene.toUpperCase()
    const variant = m.variant.toUpperCase()

    if (gene === 'FTO' && (variant === 'AA' || variant === 'RS9939609')) modifier *= 1.3
    if (gene === 'APOE' && variant.includes('E4')) modifier *= 1.15
    if (gene === 'TCF7L2') modifier *= 1.2
    if (gene === 'PPARG') modifier *= 0.9
  }

  return modifier
}

function calculateOrganStress(
  food: string,
  profile: UserProfile | null,
  glycemicIndex: number,
  carbLoad: number
) {
  const lowered = food.toLowerCase()
  const isProcessed = ['pizza', 'burger', 'fries', 'candy', 'soda', 'chips', 'cake', 'cookie', 'noodle', 'instant'].some((f) =>
    lowered.includes(f)
  )
  const isHighFat = ['burger', 'pizza', 'fries', 'bacon', 'butter', 'cream', 'fried', 'oil'].some((f) =>
    lowered.includes(f)
  )
  const isHighSugar = ['candy', 'soda', 'cake', 'cookie', 'sugar', 'donut', 'chocolate', 'ice cream'].some((f) =>
    lowered.includes(f)
  )
  const isAlcohol = ['beer', 'wine', 'whiskey', 'vodka', 'rum', 'gin', 'alcohol'].some((f) => lowered.includes(f))
  const isHighSalt = ['fries', 'chips', 'pizza', 'burger', 'soup', 'sauce', 'pickle', 'cured'].some((f) =>
    lowered.includes(f)
  )

  const ageMod = profile ? Math.min(1, profile.age / 80) : 0.5
  const bmiMod = profile
    ? Math.min(1, (profile.weight / ((profile.height / 100) ** 2) - 18.5) / 25)
    : 0.5

  return [
    {
      organ: 'Pancreas',
      stress: Math.round(Math.min(100, (glycemicIndex * 60 + carbLoad * 30) * (1 + ageMod * 0.3))),
      color: '#ef4444',
    },
    {
      organ: 'Liver',
      stress: Math.round(
        Math.min(100, (isHighFat ? 70 : 20) + (isAlcohol ? 40 : 0) + (isHighSugar ? 30 : 0) + bmiMod * 20)
      ),
      color: '#f59e0b',
    },
    {
      organ: 'Heart',
      stress: Math.round(Math.min(100, (isHighSalt ? 40 : 10) + (isHighFat ? 30 : 5) + bmiMod * 15 + ageMod * 10)),
      color: '#ef4444',
    },
    {
      organ: 'Kidneys',
      stress: Math.round(Math.min(100, (isHighSalt ? 50 : 10) + (isProcessed ? 20 : 0) + bmiMod * 10)),
      color: '#8b5cf6',
    },
    {
      organ: 'Brain',
      stress: Math.round(
        Math.min(100, (glycemicIndex * 30 + (isHighSugar ? 25 : 0) + (isAlcohol ? 20 : 0)) * (1 + ageMod * 0.2))
      ),
      color: '#06b6d4',
    },
    {
      organ: 'Stomach',
      stress: Math.round(Math.min(100, 20 + (isProcessed ? 25 : 0) + (isHighFat ? 20 : 0) + (isAlcohol ? 15 : 0))),
      color: '#10b981',
    },
    {
      organ: 'Intestines',
      stress: Math.round(Math.min(100, 15 + (isProcessed ? 20 : 0) + (isHighFat ? 15 : 0))),
      color: '#84cc16',
    },
    {
      organ: 'Immune',
      stress: Math.round(Math.min(100, (isHighSugar ? 40 : 10) + (isProcessed ? 25 : 0) + (isAlcohol ? 15 : 0))),
      color: '#ec4899',
    },
  ]
}

function generatePrediction(
  food: string,
  glucose: { value: number }[],
  insulin: { value: number }[],
  organStress: { organ: string; stress: number }[],
  cognitive: { fog: number }[],
  profile: UserProfile | null,
  kimiAnalysis?: string,
  geneticModifier?: number,
  kimiData?: KimiAnalysisResult
): string {
  const maxGlucose = Math.max(...glucose.map((g) => g.value))
  const maxInsulin = Math.max(...insulin.map((i) => i.value))
  const maxFog = Math.max(...cognitive.map((c) => c.fog))
  const highStress = organStress.filter((o) => o.stress > 60).map((o) => o.organ)

  let pred = `**Biological Response to "${kimiData?.foodName || food}"**\n\n`

  if (kimiData) {
    pred += `📊 **AI-Estimated Nutrition**: ${kimiData.estimatedCalories} kcal | ${kimiData.estimatedCarbs}g carbs | ${kimiData.estimatedProtein}g protein | ${kimiData.estimatedFat}g fat\n\n`
  }

  if (maxGlucose > 180) {
    pred += `⚠️ **Critical Glucose Spike**: Your blood glucose may reach **${maxGlucose} mg/dL** — this is a severe hyperglycemic event.`
  } else if (maxGlucose > 140) {
    pred += `⚠️ **Moderate Glucose Spike**: Blood glucose peaking at **${maxGlucose} mg/dL**. `
  } else {
    pred += `✅ **Stable Glucose**: Blood glucose stays within healthy range (**${maxGlucose} mg/dL** peak). `
  }

  if (maxInsulin > 60) {
    pred += `Your pancreas will need to secrete **${maxInsulin} µU/mL** of insulin — a heavy load. `
  } else if (maxInsulin > 30) {
    pred += `Insulin response is **${maxInsulin} µU/mL** — moderate pancreatic demand. `
  } else {
    pred += `Insulin response is minimal (**${maxInsulin} µU/mL**). `
  }

  if (profile?.hasDiabetes) {
    pred += `\n\n**Diabetes Notice**: Your condition significantly amplifies these effects. Consider pre-bolus insulin timing.`
  }

  if (highStress.length > 0) {
    pred += `\n\n**High Stress Organs**: ${highStress.join(', ')} ${highStress.length > 1 ? 'are' : 'is'} under significant load. `
  }

  if (maxFog > 50) {
    pred += `\n\n🧠 **Brain Fog Risk**: Cognitive decline of ${maxFog}% predicted. You may experience difficulty concentrating around **1.5 hours** after eating.`
  } else {
    pred += `\n\n🧠 **Cognitive Clear**: Minimal brain fog expected.`
  }

  pred += `\n\n**2-Hour Outlook**: `
  const gAt2 = glucose[Math.min(Math.floor(20 / (8 / glucose.length)), glucose.length - 1)]
  if (gAt2 && gAt2.value > 140) {
    pred += `Elevated blood glucose persists. Energy crash likely at hour 3-4.`
  } else {
    pred += `Blood glucose returning to baseline. Stable energy expected.`
  }

  pred += `\n\n**4-Hour Outlook**: `
  const gAt4 = glucose[Math.min(Math.floor(40 / (8 / glucose.length)), glucose.length - 1)]
  if (gAt4 && gAt4.value > 120) {
    pred += `Sustained elevation may affect mood and energy.`
  } else {
    pred += `System returning to homeostasis.`
  }

  pred += `\n\n**8-Hour Outlook**: `
  const gAt8 = glucose[glucose.length - 1]
  if (gAt8 && gAt8.value > 110) {
    pred += `Residual elevation present. Late-night eating may disrupt sleep quality.`
  } else {
    pred += `Full metabolic recovery. Normal physiological state restored.`
  }

  if (geneticModifier && geneticModifier > 1.1) {
    pred += `\n\n🧬 **Genetic Note**: Your genetic profile amplifies metabolic response by ${Math.round((geneticModifier - 1) * 100)}%. Consider lower-GI alternatives.`
  }

  if (kimiAnalysis) {
    pred += `\n\n---\n*Based on AI analysis: ${kimiAnalysis.slice(0, 300)}...*`
  }

  return pred
}
