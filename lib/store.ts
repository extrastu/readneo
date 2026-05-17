import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WeReadStore {
  apiKey: string | null
  setApiKey: (key: string) => void
  clearApiKey: () => void
  isConfigured: boolean
  // Flomo
  flomoApiUrl: string | null
  setFlomoApiUrl: (url: string) => void
  clearFlomoApiUrl: () => void
  // Notion
  notionToken: string | null
  notionDatabaseId: string | null
  setNotionConfig: (token: string, databaseId: string) => void
  clearNotionConfig: () => void
}

export const useWeReadStore = create<WeReadStore>()(
  persist(
    (set) => ({
      apiKey: null,
      isConfigured: false,
      setApiKey: (key: string) => set({ apiKey: key, isConfigured: true }),
      clearApiKey: () => set({ apiKey: null, isConfigured: false }),
      // Flomo
      flomoApiUrl: null,
      setFlomoApiUrl: (url: string) => set({ flomoApiUrl: url }),
      clearFlomoApiUrl: () => set({ flomoApiUrl: null }),
      // Notion
      notionToken: null,
      notionDatabaseId: null,
      setNotionConfig: (token: string, databaseId: string) =>
        set({ notionToken: token, notionDatabaseId: databaseId }),
      clearNotionConfig: () => set({ notionToken: null, notionDatabaseId: null }),
    }),
    {
      name: 'weread-config',
    }
  )
)
