import { create } from "zustand"

const useAppStore = create((set) => ({
  darkMode: false,
  search: '',
  setMode: (mode) => set({ darkMode: mode }),
  setSearch: (value) => set({ search: value }),
}))

export default useAppStore