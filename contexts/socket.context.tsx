"use client"
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import Relationship from "@/interfaces/relationship";
import { CLIENT_READY_EVENT, FRIEND_ADDED_EVENT, FRIEND_REMOVED_EVENT, FRIEND_REQUEST_RECEIVED_EVENT, GET_USERS_STATUS_EVENT, GET_VOICE_RINGS_EVENT, GET_VOICE_STATES_EVENT, MESSAGE_RECEIVED_EVENT, USER_OFFLINE_EVENT, USER_ONLINE_EVENT, USER_STATUS_UPDATE_EVENT, USER_TYPING_EVENT, VOICE_RING_CANCEL, VOICE_RING_DISMISS_EVENT, VOICE_RING_EVENT, VOICE_UPDATE_EVENT } from "@/constants/events";
import { MESSAGES_CACHE, RELATIONSHIPS_CACHE } from "@/constants/cache";
import { Message } from "@/interfaces/message";
import { HttpStatusCode } from "axios";
import { refreshToken } from "@/services/auth/auth.service";
import { useCurrentUserQuery } from "@/hooks/queries";
import { useUserPresence } from "./user-presence.context";
import { UserStatus } from "@/enums/user-status.enum";
import { useAppState } from "./app-state.context";
import { useUserProfileStore } from "@/app/stores/user-profiles-store";
import { useUserTypingStore } from "@/app/stores/user-typing-store";
import { VoiceState } from "@/interfaces/voice-state";
import { getVoiceStateKey, useGetChannelVoiceStates, useVoiceStateStore } from "@/app/stores/voice-state-store";
import { VoiceEventDTO } from "@/interfaces/dto/voice-event.dto";
import { VoiceEventType } from "@/enums/voice-event-type";
import { VoiceRingState } from "@/interfaces/voice-ring-state";
import { getVoiceRingKey, useVoiceRingStateStore } from "@/app/stores/voice-ring-state-store";
import { useAudioStore } from "@/app/stores/audio-store";
import { useAppSettingsStore } from "@/app/stores/app-settings-store";

export interface SocketContextType {
    socket: Socket;
    isReady: boolean;
}

const SocketContext = createContext<SocketContextType>(null!);

export function useSocket() {
    return useContext(SocketContext);
}

export default function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket>(null!)
    const [isReady, setIsReady] = useState(false);
    const { data: user } = useCurrentUserQuery();
    const queryClient = useQueryClient();
    const { presenceMap, updatePresence, } = useUserPresence();
    const { userProfiles, updateStatus } = useUserProfileStore();
    const { handleTypingStart, handleTypingStop } = useUserTypingStore();
    const { updateVoiceState, removeVoiceState, setVoiceStates } = useVoiceStateStore();
    const { setVoiceRingStates, batchUpdateVoiceRingState, removeVoiceRingState } = useVoiceRingStateStore();
    const { playSound, stopSound } = useAudioStore();
    const { mediaSettings } = useAppSettingsStore();
    function handleFriendReceived(payload: Relationship) {
        queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
            if (!old) {
                return [payload];
            }
            return [...old, payload];
        })
    }

    function handleFriendAdded(payload: Relationship) {
        queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
            if (!old) {
                return [payload];
            }
            return old.map(rel => rel.id === payload.id ? payload : rel);
        })
    }

    function handleFriendRemoved(payload: Relationship) {
        queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
            if (!old) {
                return [];
            }
            return old.filter(rel => rel.id !== payload.id);
        })
    }

    function handleFriendOnline(userId: string) {
        updatePresence(userId, true);
    }

    function handleFriendOffline(userId: string) {
        updatePresence(userId, false);
    }

    function handleMessageReceived(payload: Message) {
        handleTypingStop(payload.channelId, payload.senderId);
        queryClient.setQueryData<Message[]>([MESSAGES_CACHE, payload.channelId], (old) => {
            if (!old) {
                return [];
            }

            payload.createdAt = new Date(payload.createdAt);

            const newMessages = [...old, payload];
            return newMessages;
        })
    }

    const handleUserStatusUpdate = (payload: { userId: string, status: UserStatus }) => {
        updateStatus(payload.userId, payload.status);
    };

    const handleUserTyping = (payload: { userId: string, channelId: string }) => {
        handleTypingStart(payload.channelId, payload.userId);
    }


    const handleVoiceStateUpdate = async (event: VoiceEventDTO) => {
        const voiceStates = useGetChannelVoiceStates(event.channelId);
        if (event.type == VoiceEventType.VOICE_LEAVE) {
            removeVoiceState(event.channelId, event.userId);
        }
        else {
            updateVoiceState(event.data)
        }
    };

    const handleGetVoiceStates = (payload: VoiceState[]) => {
        const map: Map<string, VoiceState> = new Map();

        for (const vs of payload) {
            map.set(getVoiceStateKey(vs.channelId, vs.userId), vs);
        }

        setVoiceStates(map);
    }


    
    useEffect(() => {
        if (!socket) return;
        socket.on(USER_STATUS_UPDATE_EVENT, handleUserStatusUpdate);
    }, [userProfiles, socket])

    useEffect(() => {
        if (!socket) return;
        socket.on(FRIEND_REQUEST_RECEIVED_EVENT, handleFriendReceived);
        socket.on(FRIEND_REMOVED_EVENT, handleFriendRemoved);
        socket.on(FRIEND_ADDED_EVENT, handleFriendAdded);
        socket.on(USER_ONLINE_EVENT, handleFriendOnline);
        socket.on(USER_OFFLINE_EVENT, handleFriendOffline);
        socket.on(MESSAGE_RECEIVED_EVENT, handleMessageReceived);
        socket.on(USER_TYPING_EVENT, handleUserTyping)
        socket.on(VOICE_UPDATE_EVENT, handleVoiceStateUpdate);
        socket.on(GET_VOICE_STATES_EVENT, handleGetVoiceStates);
        socket.on("connect", () => {
            setIsReady(true);
        });
        socket.on('connect_error', (error: any) => {
            if (error.description === HttpStatusCode.Unauthorized) {
                refreshToken();
            }
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            setIsReady(false);
        }

    }, [socket])

    useEffect(() => {
        if (!user || isReady) return;

        const sock = io(process.env.NEXT_PUBLIC_WS_GATEWAY, {
            withCredentials: true
        });
        setSocket(sock);
        sock.emit(CLIENT_READY_EVENT);
    }, [user]);


    return <SocketContext.Provider value={{ socket, isReady }}>
        {children}
    </SocketContext.Provider>
}