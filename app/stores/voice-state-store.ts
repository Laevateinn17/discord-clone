import { VoiceState } from "@/interfaces/voice-state";
import { kMaxLength } from "buffer";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";

type VoiceStateMap = Map<string, VoiceState>

interface VoiceStateStoreState {
    voiceStates: Map<string, VoiceState>;
    setVoiceStates: (voiceStates: VoiceStateMap) => void;
    updateVoiceState: (voiceState: VoiceState) => void;
    removeVoiceState: (channelId: string, userId: string) => void;
}

export const useVoiceStateStore = create<VoiceStateStoreState>((set, get) => ({
    voiceStates: new Map(),
    setVoiceStates: (voiceStates: VoiceStateMap) => set({ voiceStates }),
    updateVoiceState: (voiceState: VoiceState) => {
        set(state => {
            const newVoiceStates = new Map(state.voiceStates);
            newVoiceStates.set(getVoiceStateKey(voiceState.channelId, voiceState.userId), voiceState);
            return { voiceStates: newVoiceStates };
        });

    },
    removeVoiceState: (channelId: string, userId: string) => {
        set((state) => {
            const newVoiceStates = new Map(state.voiceStates)
            const vs = newVoiceStates.get(getVoiceStateKey(channelId, userId));
            if (vs) {
                newVoiceStates.delete(getVoiceStateKey(vs.channelId, vs.userId));
            }

            return { voiceStates: newVoiceStates };
        })
    }
}));

export function getVoiceStateKey(channelId: string, userId: string) {
    return `${channelId}:${userId}`
}

export function useGetChannelVoiceStates(channelId: string): VoiceState[] {
  const voiceStates = useVoiceStateStore.getState().voiceStates;

  return Array.from(voiceStates.entries())
    .filter(([key]) => key.startsWith(channelId))
    .map(([, state]) => state);
}