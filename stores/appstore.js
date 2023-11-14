import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAppStore = create(
    persist(
        (set, get) => ({
            
            messages: [],
            threadId: '',
            runId: '',
            
            addMessage: (newmessage) => {
                
                let messages = get().messages.slice(0)
                messages.push(newmessage)
                
                set({
                    messages: messages
                })
            },
            clearMessages: () => set({ messages: [] }),
            setThreadId: (id) => set({ threadId: id }),
            setRunId: (id) => set({ runId: id })
            
        }),
        {
            name: 'openai-api-function-call-sample-storage',
            storage: createJSONStorage(() => localStorage),
            version: 1,
        }
    )
)

export default useAppStore