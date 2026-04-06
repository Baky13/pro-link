import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    set => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: ({ accessToken, refreshToken, user }) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({ user, accessToken, refreshToken })
      },
      logout: () => {
        localStorage.clear()
        set({ user: null, accessToken: null, refreshToken: null })
      },
    }),
    { name: 'auth' }
  )
)

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggle: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', next)
        set({ theme: next })
      },
      init: () => {
        const theme = get().theme
        document.documentElement.setAttribute('data-theme', theme)
      },
    }),
    { name: 'theme' }
  )
)

export const useLangStore = create(
  persist(
    set => ({
      lang: 'ru',
      setLang: lang => set({ lang }),
    }),
    { name: 'lang' }
  )
)
