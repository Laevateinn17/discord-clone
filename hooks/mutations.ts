import { CURRENT_USER_CACHE, MESSAGES_CACHE, RELATIONSHIPS_CACHE } from "@/constants/query-keys";
import { RelationshipType } from "@/enums/relationship-type.enum";
import { CreateMessageDto } from "@/interfaces/dto/create-message.dto";
import Relationship from "@/interfaces/relationship";
import { logout } from "@/services/auth/auth.service";
import { sendMessage } from "@/services/messages/messages.service";
import { acceptFriendRequest, declineFriendRequest } from "@/services/relationships/relationships.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Message } from "@/interfaces/message";
import { useCurrentUserStore } from "@/app/stores/current-user-store";
import { MessageStatus } from "@/enums/message-status.enum";
import { useChannelsStore, useGetChannel } from "@/app/stores/channels-store";
import { useGuildsStore } from "@/app/stores/guilds-store";




export function useLogoutMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => await logout(),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: [CURRENT_USER_CACHE] });
        }
    });
}

export function useDeleteRelationshipMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (relationship: Relationship) => declineFriendRequest(relationship.id),
        onSuccess: (_, relationship) => {
            queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
                if (!old) {
                    return [];
                }
                return old.filter(rel => rel.id !== relationship.id);
            })
        }
    });
}

export function useAcceptFriendRequestMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (relationship: Relationship) => acceptFriendRequest(relationship.id),
        onSuccess: (_, relationship) => {
            queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
                if (!old) {
                    return [relationship];
                }
                return old.map((rel) =>
                    rel.id === relationship.id ? { ...rel, type: RelationshipType.Friends } : rel
                );
            })
        }
    });
}

export function useSendMessageMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dto: CreateMessageDto) => sendMessage(dto),
        onMutate: (dto) => {
            const messages = queryClient.getQueryData<Message[]>([MESSAGES_CACHE, dto.channelId]);
            const { user } = useCurrentUserStore.getState();
            const { getChannel, updateChannel } = useChannelsStore.getState();
            const channel = getChannel(dto.channelId);

            const id = `pending-${messages!.length}`
            const createdAt = new Date();
            const message: Message = {
                id: id,
                createdAt: createdAt,
                updatedAt: createdAt,
                senderId: user.id,
                status: MessageStatus.Pending,
                attachments: [],
                channelId: dto.channelId,
                content: dto.content,
                mentions: dto.mentions,
                is_pinned: false,
            };

            if (channel) {
                updateChannel({ ...channel!, lastReadId: message.id });
            }

            queryClient.setQueryData<Message[]>([MESSAGES_CACHE, dto.channelId], (old) => {
                if (!old) {
                    return [];
                }

                const newMessages = [...old, message];

                return newMessages;
            });

            //TODO: handle error when sending message
            return message;
        },
        onSuccess: (response, dto, optimisticMessage) => {
            const { getChannel, updateChannel } = useChannelsStore.getState();
            const channel = getChannel(dto.channelId);
            if (!response.success) {
                queryClient.setQueryData<Message[]>([MESSAGES_CACHE, dto.channelId], (old) => {
                    if (!old) {
                        return [];
                    }

                    const newMessages = [...old].map(m => {
                        if (m.id === message.id) {
                            m.status = MessageStatus.Error;
                        }
                        return m;
                    });
                    return newMessages;
                })
                return;
            }

            const message = response.data!;
            queryClient.setQueryData<Message[]>([MESSAGES_CACHE, dto.channelId], (old) => {
                if (!old) {
                    return [];
                }
                message.createdAt = new Date(message.createdAt);

                const newMessages = [...old].map(m => {
                    if (m.id === optimisticMessage.id) {
                        return response.data!;
                    }
                    return m;
                });
                return newMessages;
            });

            if (!channel) return;
            updateChannel({ ...channel, lastReadId: response.data!.id });
        }
    })
}

export function useSendMessageGuildMutation(guildId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dto: CreateMessageDto) => sendMessage(dto),
        onMutate: (dto) => {
            const messages = queryClient.getQueryData<Message[]>([MESSAGES_CACHE, dto.channelId]) ?? [];
            const { user } = useCurrentUserStore.getState();
            const { getChannel, updateChannel } = useChannelsStore.getState();
            const { getGuild, updateChannelLastRead } = useGuildsStore.getState();
            const guild = getGuild(guildId as string);
            const channel = guild?.channels.find(ch => ch.id === dto.channelId);

            const id = `pending-${messages.length}`
            const createdAt = new Date();
            const message: Message = {
                id: id,
                createdAt: createdAt,
                updatedAt: createdAt,
                senderId: user.id,
                status: MessageStatus.Pending,
                attachments: [],
                channelId: dto.channelId,
                content: dto.content,
                mentions: dto.mentions,
                is_pinned: false,
            };

            queryClient.setQueryData<Message[]>([MESSAGES_CACHE, dto.channelId], (old) => {
                if (!old) {
                    return [];
                }

                const newMessages = [...old, message];

                return newMessages;
            });
            
            if (channel) {
                updateChannelLastRead( guildId, dto.channelId, message.id );
            }


            return message;
        },
        onSuccess: (response, dto, optimisticMessage) => {
            const { getGuild, updateChannelLastRead } = useGuildsStore.getState();
            const guild = getGuild(guildId as string);
            const channel = guild?.channels.find(ch => ch.id === dto.channelId);
            if (!response.success) {
                queryClient.setQueryData<Message[]>([MESSAGES_CACHE, dto.channelId], (old) => {
                    if (!old) {
                        return [];
                    }

                    const newMessages = [...old].map(m => {
                        if (m.id === message.id) {
                            m.status = MessageStatus.Error;
                        }
                        return m;
                    });
                    return newMessages;
                })
                return;
            }

            const message = response.data!;
            queryClient.setQueryData<Message[]>([MESSAGES_CACHE, dto.channelId], (old) => {
                if (!old) {
                    return [];
                }
                message.createdAt = new Date(message.createdAt);

                const newMessages = [...old].map(m => {
                    if (m.id === optimisticMessage.id) {
                        return response.data!;
                    }
                    return m;
                });
                return newMessages;
            });

            if (!channel) return;
            updateChannelLastRead(guildId as string, dto.channelId as string, response.data!.id);
        }
    })
}