import { create } from 'zustand'

export interface SimulationResult {
  glucose: { time: number; value: number }[]
  insulin: { time: number; value: number }[]
  organStress: { organ: string; stress: number; color: string }[]
  cognitive: { time: number; focus: number; fog: number }[]
  prediction: string
}

export interface UserProfile {
  name: string
  age: number
  weight: number
  height: number
  gender: string
  activityLevel: string
  sleepHours: number
  hasDiabetes: boolean
  geneticMarkers: { gene: string; variant: string }[]
}

interface SimulationState {
  currentFood: string
  imageBase64: string | null
  result: SimulationResult | null
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  setCurrentFood: (food: string) => void
  setImage: (img: string | null) => void
  setResult: (result: SimulationResult | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialResult: SimulationResult = {
  glucose: [],
  insulin: [],
  organStress: [],
  cognitive: [],
  prediction: '',
}

export const useSimulationStore = create<SimulationState>((set) => ({
  currentFood: '',
  imageBase64: null,
  result: null,
  profile: null,
  isLoading: false,
  error: null,
  setCurrentFood: (food) => set({ currentFood: food }),
  setImage: (img) => set({ imageBase64: img }),
  setResult: (result) => set({ result }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      currentFood: '',
      imageBase64: null,
      result: null,
      isLoading: false,
      error: null,
    }),
}))
