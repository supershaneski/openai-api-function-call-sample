import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const APP_STORAGE_KEY = 'openai-api-function-call-sample-storage'

const useAppStore = create(
    persist(
        (set, get) => ({
            
            messages: [],
            threadId: '',
            runId: '',
            mode: 0,
            
            addMessage: (newmessage) => {
                
                let messages = get().messages.slice(0)
                messages.push(newmessage)
                
                set({
                    messages: messages
                })
            },
            clearMessages: () => set({ messages: [] }),
            setThreadId: (id) => set({ threadId: id }),
            setRunId: (id) => set({ runId: id }),
            setMode: (n) => set({ mode: n }),
            
        }),
        {
            name: APP_STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            version: 1,
        }
    )
)

export default useAppStore