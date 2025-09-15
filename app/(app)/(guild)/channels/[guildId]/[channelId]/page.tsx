"use client"
import { useGuildDetailQuery, useMessagesQuery } from "@/hooks/queries";
import { useParams, useRouter } from "next/navigation";
import { Fragment, KeyboardEvent, useEffect, useState } from "react";
import styled from "styled-components";
import { GuildChannelHeader } from "./header";
import { CreateMessageDto } from "@/interfaces/dto/create-message.dto";
import { useCurrentUserStore } from "@/app/stores/current-user-store";
import { MessageStatus } from "@/enums/message-status.enum";
import { Message } from "@/interfaces/message";
import { useChannelsStore } from "@/app/stores/channels-store";
import { useQueryClient } from "@tanstack/react-query";
import { MESSAGES_CACHE } from "@/constants/query-keys";
import { sendMessage } from "@/services/messages/messages.service";
import MessageItem from "@/components/message-item/message-item";
import { useUserProfileStore } from "@/app/stores/user-profiles-store";
import { dateToShortDate } from "@/utils/date.utils";
import { FaCirclePlus } from "react-icons/fa6";
import { Channel } from "@/interfaces/channel";
import { LINE_HEIGHT, MAX_LINE_COUNT, VERTICAL_PADDING } from "@/constants/user-interface";
import { sendTypingStatus } from "@/services/channels/channels.service";
import { LoadingIndicator } from "@/components/loading-indicator/loading-indicator";
import { useTypingUsersFromChannel } from "@/app/stores/user-typing-store";

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
`

const MessagesContainer = styled.div`
    flex-grow: 1;
    width: auto;
    overflow-y: auto;
    padding-top: 24px;
    padding-bottom: 12px;
    display: flex;
    flex-direction: column-reverse;
    overflow-anchor: auto;

    &::-webkit-scrollbar {
        width: 16px;
    }

    &::-webkit-scrollbar-thumb {
        border: 4px solid rgba(0, 0, 0, 0);
        background-clip: padding-box;
        border-radius: 10px;
        background-color: #888;
    }
`

const ChatInputWrapper = styled.div`
    padding: 0 8px;
    margin-bottom: 24px;
    position: relative;
`

const InputContainer = styled.div`
    width: 100%;
    background-color: var(--chat-background-default);
    border-radius: 8px;
    border: 1px solid var(--border-faint);
    display: flex;
    align-items: flex-start;
`

const TextInput = styled.textarea`
    padding: 16px 0;
    line-height: 22px;
    flex-grow: 1;
    background-color: initial;
    margin-left: 10px;
    min-height: 54px;
    resize: none;
    color: var(--text-normal);

    &:focus {
        outline: none;
    }

    &::placeholder {
        color: var(--placeholder);
    }

    &::-ms-input-placeholder {
        color: var(--placeholder);
    }

    &::-webkit-scrollbar {
        width: 10px;
    }

    &::-webkit-scrollbar-thumb {
        border: 3px solid rgba(0, 0, 0, 0);
        background-clip: padding-box;
        border-radius: 10px;
        background-color: #888;
    }
`

const UploadItemContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 16px;
    color: var(--interactive-normal);
    cursor: pointer;
    min-height: 54px;
    
    &:hover {
        color: var(--interactive-hover);
    }
`

const MessageDivider = styled.div`
    height: 0;
    border-top: 1px solid rgba(151, 151, 159, 0.12);
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 16px;
    margin-top: 24px;
    p {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);   
        background-color: var(--background-secondary);
        padding: 0 4px;
    }
`

const LastReadDividerLine = styled.div`
    height: 0;
    border-top: 1px solid var(--status-danger);
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 6px 16px;
    position: relative;
    p {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-danger);   
        background-color: var(--background-secondary);
        padding: 0 4px;
    }
`

function LastReadDivider() {
    return (
        <LastReadDividerLine>
            <span className="absolute flex right-0 text-[10px] leading-[13px] font-bold bg-[var(--status-danger)] rounded-sm px-[4px]">
                NEW
            </span>
        </LastReadDividerLine>
    )
}

function TextInputItem({ channel, onSubmit }: { channel: Channel, onSubmit: (message: CreateMessageDto) => any }) {
    const [inputHeight, setInputHeight] = useState(LINE_HEIGHT + VERTICAL_PADDING)
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isTypingStatusCooldown, setTypingStatusCooldown] = useState(false);

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const dto: CreateMessageDto = { channelId: channel.id as string, content: text, attachments: attachments, mentions: [] as string[], createdAt: new Date() };
            onSubmit(dto);
            onInputChanged('');
        }
    }

    function onInputChanged(text: string) {
        setText(text);
        const lineCount = 1 + (text.match(/\n/g) || []).length;
        setInputHeight((lineCount > MAX_LINE_COUNT ? MAX_LINE_COUNT : lineCount) * LINE_HEIGHT + VERTICAL_PADDING);
        if (!isTypingStatusCooldown) {
            sendTypingStatus(channel.id);
            setTypingStatusCooldown(true);
            setTimeout(() => {
                setTypingStatusCooldown(false);
            }, 8000)
        }
    }

    const [text, setText] = useState('');
    return (
        <TextInput value={text} onKeyDown={handleKeyDown} style={{ height: inputHeight }} onChange={(e) => onInputChanged(e.target.value)} placeholder={`Message @${channel.recipients[0].displayName}`} />

    )
}

function formatTyping(names: string[]) {
    if (names.length <= 0) return "";
    if (names.length == 1) return names[0];
    else return names.concat(", ");
}

export default function Page() {
    const { guildId, channelId } = useParams();
    const { user } = useCurrentUserStore();
    const router = useRouter();
    const { isPending, data: guild } = useGuildDetailQuery(guildId ? guildId.toString() : '');
    const channel = guild?.channels.find(ch => ch.id == channelId)!;
    const { data: messages } = useMessagesQuery(channelId! as string);
    const [groupedMessages, setGroupedMessages] = useState<Record<string, Message[]> | undefined>();
    const { getUserProfile } = useUserProfileStore();
    const { getChannel, updateChannel } = useChannelsStore();
    const queryClient = useQueryClient();

    const typingUsers = useTypingUsersFromChannel(channelId as string);

    async function handleSubmit(dto: CreateMessageDto) {
        const id = `pending-${messages!.length}`
        const createdAt = new Date();
        const message: Message = {
            id: id,
            createdAt: createdAt,
            updatedAt: createdAt,
            senderId: user!.id,
            status: MessageStatus.Pending,
            attachments: [],
            channelId: channelId as string,
            content: dto.content,
            mentions: dto.mentions,
            is_pinned: false,
        };

        if (channel) {
            updateChannel({ ...channel!, lastReadId: message.id });
        }


        queryClient.setQueryData<Message[]>([MESSAGES_CACHE, channelId], (old) => {
            if (!old) {
                return [];
            }

            const newMessages = [...old, message];

            return newMessages;
        })
        const response = await sendMessage(dto);

        if (!response.success) {
            queryClient.setQueryData<Message[]>([MESSAGES_CACHE, channelId], (old) => {
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

        queryClient.setQueryData<Message[]>([MESSAGES_CACHE, channelId], (old) => {
            if (!old) {
                return [];
            }
            const data = response.data!;
            data.createdAt = new Date(data.createdAt);

            const newMessages = [...old].map(m => {
                if (m.id === message.id) {
                    return response.data!;
                }
                return m;
            });
            return newMessages;
        });
        if (!channel) return;
        updateChannel({ ...channel, lastReadId: response.data!.id });
    }


    useEffect(() => {
        if (!guild) return;
        document.title = `Viscord | ${guild.name}`
    }, [guild])

    if (isPending) {
        return <p>Loading...</p>;
    }


    return (
        <div className="h-full flex flex-col">
            <GuildChannelHeader channel={channel} />
            <ChatContainer>
                <MessagesContainer>
                    {groupedMessages && Object.keys(groupedMessages).map((key) => {
                        const messages = groupedMessages[key];
                        return (
                            <Fragment key={key}>
                                {messages?.map(message => {
                                    const index = messages.findIndex(m => m.id === message.id)
                                    const prev = messages.at(index - 1);
                                    const isSubsequent = index !== 0 && (message.createdAt.getMinutes() - prev!.createdAt.getMinutes()) < 5 && message.senderId === prev!.senderId;
                                    return (
                                        <Fragment key={message.id}>
                                            {message.id === channel.lastReadId && index !== messages.length - 1 && <LastReadDivider />}
                                            <MessageItem
                                                message={{ ...message }}
                                                isSubsequent={isSubsequent}
                                                sender={getUserProfile(message.senderId)!} />
                                        </Fragment>
                                    )
                                }).reverse()}
                                <MessageDivider><p>{dateToShortDate(messages[0].createdAt)}</p></MessageDivider>
                            </Fragment>)
                    }).reverse()}
                </MessagesContainer>
                <ChatInputWrapper>
                    <InputContainer>
                        <UploadItemContainer><FaCirclePlus size={20} /></UploadItemContainer>
                        <TextInputItem channel={channel} onSubmit={handleSubmit} />
                    </InputContainer>
                    {typingUsers.length > 0 &&
                        <div className="ml-2 text-[12px] h-[24px] items-center flex absolute w-full">
                            <span className="mr-2">
                                <LoadingIndicator></LoadingIndicator>
                            </span>

                            <span className="font-bold">{formatTyping(typingUsers.map(tu => getUserProfile(tu.userId)!.displayName))}</span>&nbsp;is typing...
                        </div>}
                </ChatInputWrapper>
            </ChatContainer>
        </div>
    )
}