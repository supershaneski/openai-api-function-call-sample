import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const useDataStore = create(
    persist(
        (set, get) => ({
            data: [],
            add: (item) => {

                let data = get().data.slice(0)
                data.push(item)

                set({ data })

            },
            delete: (id) => {

                let data = get().data.slice(0).filter((a) => a.id !== id)

                set({ data })

            },
            clear: () => set({ data: [] })
        }),
        {
            name: "openai-api-sample-app-storage",
            storage: createJSONStorage(() => localStorage),
            version: 1,
        }
    )
)

export default useDataStore