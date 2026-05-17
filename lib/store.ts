import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WeReadStore {
  apiKey: string | null
  setApiKey: (key: string) => void
  clearApiKey: () => void
  isConfigured: boolean
}

export const useWeReadStore = create<WeReadStore>()(
  persist(
    (set) => ({
      apiKey: null,
      isConfigured: false,
      setApiKey: (key: string) => set({ apiKey: key, isConfigured: true }),
      clearApiKey: () => set({ apiKey: null, isConfigured: false }),
    }),
    {
      name: 'weread-config',
    }
  )
)
