import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type InitialState = {
  loginData: object | null
}

type ILoginStore = InitialState & {
  setLoginData: (loginData: InitialState['loginData']) => void
  reset: () => void
}

const initialState = {
  loginData: null,
}

export const useLoginStore = create(
  persist<ILoginStore>(
    set => ({
      ...initialState,
      setLoginData: loginData => set({ loginData }),
      reset: () => set(initialState),
    }),
    { name: 'login-store' }
  )
)
