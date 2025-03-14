"use client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth.context";
import { useQueryClient } from "@tanstack/react-query";
import Relationship from "@/interfaces/relationship";
import { FRIEND_ADDED_EVENT, FRIEND_REMOVED_EVENT, FRIEND_REQUEST_RECEIVED_EVENT, USER_OFFLINE_EVENT, USER_ONLINE_EVENT } from "@/constants/message-broker";
import { RELATIONSHIPS_CACHE } from "@/constants/cache";

export interface SocketContextType {
    socket: Socket
}

const SocketContext = createContext<SocketContextType>(null!);

export function useSocket() {
    return useContext(SocketContext);
}

export default function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket>(null!)
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        if (!socket) {
            const sock = io(process.env.NEXT_PUBLIC_WS_GATEWAY, {
                withCredentials: true
            });
            setSocket(sock);
            sock.on("connect", () => {
                console.log("socket connected:", sock.id);
            });
        }
    }, [user])

    function handleFriendReceived(payload: Relationship) {
        console.log("received friend request", payload);
        queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
            if (!old) {
                return [payload];
            }
            return [...old, payload];
        })
    }

    function handleFriendAdded(payload: Relationship) {
        console.log("friend added", payload);
        queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
            if (!old) {
                return [payload];
            }
            return old.map(rel => rel.id === payload.id ? payload : rel);
        })
    }

    function handleFriendRemoved(payload: Relationship) {
        console.log("received relationship removal", payload);
        queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
            if (!old) {
                return [];
            }
            return old.filter(rel => rel.id !== payload.id);
        })
    }

    function handleFriendOnline(userId: string) {
        console.log("user is online", userId)
        queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
            if (!old) {
                return [];
            }
            const oldRel = old.find(rel => rel.user.id === userId)!;

            const updatedRel: Relationship = {
                ...oldRel,
                user: {
                    ...oldRel.user,
                    isOnline: true
                }
            };

            const newData = old.filter(rel => rel.user.id !== userId);

            return [...newData, updatedRel];
        })
    }

    function handleFriendOffline(userId: string) {
        console.log("user is offline", userId)
        queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
            if (!old) {
                return [];
            }

            const oldRel = old.find(rel => rel.user.id === userId)!;

            const updatedRel: Relationship = {
                ...oldRel,
                user: {
                    ...oldRel.user,
                    isOnline: false
                }
            };

            const newData = old.filter(rel => rel.user.id !== userId);

            return [...newData, updatedRel];
        })
    }

    useEffect(() => {
        if (!socket) return;
        socket.on(FRIEND_REQUEST_RECEIVED_EVENT, handleFriendReceived);
        socket.on(FRIEND_REMOVED_EVENT, handleFriendRemoved);
        socket.on(FRIEND_ADDED_EVENT, handleFriendAdded);
        socket.on(USER_ONLINE_EVENT, handleFriendOnline);
        socket.on(USER_OFFLINE_EVENT, handleFriendOffline);

    }, [socket])

    useEffect(() => {
        return () => {
            if (!socket) return;
            socket.removeAllListeners();
            socket.disconnect();
        }
    }, [])

    return <SocketContext.Provider value={{ socket }}>
        {children}
    </SocketContext.Provider>
}