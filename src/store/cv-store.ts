import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Message, SessionMode, AIEngine, SectionState, SECTIONS } from "@/types/chat";
import { CVData } from "@/types/cv";

interface CVStore {
  // Session
  sessionMode: SessionMode | null;
  aiEngine: AIEngine | null;
  isGeminiConfigured: boolean;
  isOpenaiConfigured: boolean;
  isOpenrouterConfigured: boolean;
  isGroqConfigured: boolean;
  userId: string;
  parsedCVText: string | null;
  uploadedFilename: string | null;

  // API Keys (stored in session for client-side usage)
  geminiApiKey: string | null;
  openaiApiKey: string | null;
  openrouterApiKey: string | null;
  groqApiKey: string | null;

  // Model selection (for providers that support custom models)
  openrouterModel: string;
  groqModel: string;

  // Messages
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;

  // Sections
  sections: SectionState[];

  // CV Generation
  cvData: CVData | null;
  isGenerating: boolean;
  downloadUrl: string | null;
  showModal: boolean;

  // Actions
  setSessionMode: (mode: SessionMode) => void;
  setAIEngine: (engine: AIEngine) => void;
  setEngineConfigured: (engine: AIEngine, configured: boolean) => void;
  setUserId: (id: string) => void;
  setParsedCVText: (text: string, filename: string) => void;
  setApiKey: (engine: AIEngine, apiKey: string) => void;
  setModel: (engine: AIEngine, model: string) => void;
  addMessage: (message: Message) => void;
  setIsStreaming: (streaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  commitStreamingMessage: () => void;
  markSectionComplete: (sectionId: string) => void;
  setActiveSectionNext: () => void;
  setCVData: (data: CVData) => void;
  setIsGenerating: (generating: boolean) => void;
  setDownloadUrl: (url: string) => void;
  setShowModal: (show: boolean) => void;
  reset: () => void;
}

const initialState = {
  sessionMode: null,
  aiEngine: null,
  isGeminiConfigured: false,
  isOpenaiConfigured: false,
  isOpenrouterConfigured: false,
  isGroqConfigured: false,
  userId: "anonymous",
  parsedCVText: null,
  uploadedFilename: null,
  geminiApiKey: null,
  openaiApiKey: null,
  openrouterApiKey: null,
  groqApiKey: null,
  openrouterModel: "auto",
  groqModel: "llama-3.1-70b-versatile",
  messages: [],
  isStreaming: false,
  streamingContent: "",
  sections: SECTIONS.map((s) => ({ ...s })),
  cvData: null,
  isGenerating: false,
  downloadUrl: null,
  showModal: false,
};

export const useCVStore = create<CVStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSessionMode: (mode) => set({ sessionMode: mode }),
      setAIEngine: (engine) => set({ aiEngine: engine }),
      setEngineConfigured: (engine, configured) => {
        switch (engine) {
          case "gemini":
            return set({ isGeminiConfigured: configured });
          case "chatgpt":
            return set({ isOpenaiConfigured: configured });
          case "openrouter":
            return set({ isOpenrouterConfigured: configured });
          case "groq":
            return set({ isGroqConfigured: configured });
        }
      },
      setUserId: (id) => set({ userId: id }),

      setParsedCVText: (text, filename) =>
        set({ parsedCVText: text, uploadedFilename: filename }),

      setApiKey: (engine, apiKey) => {
        switch (engine) {
          case "gemini":
            return set({ geminiApiKey: apiKey });
          case "chatgpt":
            return set({ openaiApiKey: apiKey });
          case "openrouter":
            return set({ openrouterApiKey: apiKey });
          case "groq":
            return set({ groqApiKey: apiKey });
        }
      },

      setModel: (engine, model) => {
        switch (engine) {
          case "openrouter":
            return set({ openrouterModel: model });
          case "groq":
            return set({ groqModel: model });
          default:
            return;
        }
      },

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      setIsStreaming: (streaming) => set({ isStreaming: streaming }),

      setStreamingContent: (content) => set({ streamingContent: content }),

      appendStreamingContent: (chunk) =>
        set((state) => ({ streamingContent: state.streamingContent + chunk })),

      commitStreamingMessage: () => {
        const { streamingContent } = get();
        if (!streamingContent.trim()) return;
        const message: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: streamingContent,
          timestamp: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, message],
          streamingContent: "",
          isStreaming: false,
        }));
      },

      markSectionComplete: (sectionId) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId ? { ...s, status: "done" } : s
          ),
        }));
        get().setActiveSectionNext();
      },

      setActiveSectionNext: () => {
        set((state) => {
          const sections = state.sections.map((s) => ({ ...s }));
          const firstPending = sections.find((s) => s.status === "pending");
          if (firstPending) {
            firstPending.status = "active";
          }
          return { sections };
        });
      },

      setCVData: (data) => set({ cvData: data }),
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      setDownloadUrl: (url) => set({ downloadUrl: url }),
      setShowModal: (show) => set({ showModal: show }),

      reset: () => set(initialState),
    }),
    {
      name: "cv-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        sessionMode: state.sessionMode,
        aiEngine: state.aiEngine,
        isGeminiConfigured: state.isGeminiConfigured,
        isOpenaiConfigured: state.isOpenaiConfigured,
        isOpenrouterConfigured: state.isOpenrouterConfigured,
        isGroqConfigured: state.isGroqConfigured,
        userId: state.userId,
        parsedCVText: state.parsedCVText,
        uploadedFilename: state.uploadedFilename,
        messages: state.messages,
        sections: state.sections,
        cvData: state.cvData,
        openrouterModel: state.openrouterModel,
        groqModel: state.groqModel,
      }),
    }
  )
);
