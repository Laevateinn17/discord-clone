"use client"
import ContentHeader from "@/app/(home)/content-header";
import Tooltip from "@/components/tooltip/tooltip";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { DM_CHANNELS_CACHE } from "@/constants/cache";
import { useDMChannelsQuery } from "@/hooks/queries";
import { Channel } from "@/interfaces/channel";
import { getDMChannels } from "@/services/channels/channels.service";
import { QueryCache, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";
import { PiChartLineDownLight } from "react-icons/pi";
import styled from "styled-components";

const UserProfileHeader = styled.div`
    display: flex;
    align-items: center;
    max-height: auto;
`

const UserProfileHeaderText = styled.p`
    color: var(--text-default);
    line-height: 20px;
    font-weight: 500;
    position: relative;
`

const UserProfileHeaderTextContainer = styled.div`
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 4px;
    margin-right: 8px;
    cursor: pointer;
`

function Header({ channel }: { channel: Channel }) {
    const [isHoveringName, setIsHoveringName] = useState(false);

    return (
        <ContentHeader>
            <UserProfileHeader>
                <div className="ml-[4px] mr-[8px]">
                    <UserAvatar user={channel.recipients[0]} size="24" />
                </div>
                <UserProfileHeaderTextContainer onMouseEnter={() => setIsHoveringName(true)} onMouseLeave={() => setIsHoveringName(false)}>
                    <UserProfileHeaderText>
                        {channel.recipients[0].displayName}
                    </UserProfileHeaderText>
                    <Tooltip
                        position="bottom"
                        show={isHoveringName}
                        text={channel.recipients[0].username}
                        fontSize="14px" />
                </UserProfileHeaderTextContainer>
            </UserProfileHeader>
        </ContentHeader>

    )
}

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
`

const MessagesContainer = styled.div`
    display: flex;
    flex-grow: 1;
`

const ChatInputWrapper = styled.div`
    padding: 0 8px;
    margin-bottom: 24px;
`

const InputContainer = styled.div`
    width: 100%;
    background-color: var(--chat-background-default);
    border-radius: 8px;
    border: 1px solid var(--border-faint);
    display: flex;
`

const TextInput = styled.input`
    padding: 16px 0;
    line-height: 22px;
    flex-grow: 1;
    background-color: initial;
    margin-left: 10px;
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
`

const UploadItemContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 16px;
    color: var(--interactive-normal);
    cursor: pointer;
    
    &:hover {
        color: var(--interactive-hover);
    }

`


export default function Page() {
    const { channelId } = useParams();
    const { isPending, data: channels } = useDMChannelsQuery()
    const [channel, setChannel] = useState<Channel>()


    useEffect(() => {
        if (!channels) return;

        const ch = channels.find(ch => ch.id === channelId)
        setChannel(ch)

        document.title = `Viscord | @${ch?.recipients[0].displayName}`
    }, [channels])

    if (!channel) {
        return <p></p>
    }


    return (
        <div className="h-full flex flex-col">
            <Header channel={channel} />
            <ChatContainer>
                <MessagesContainer>
                    tes
                </MessagesContainer>
                <ChatInputWrapper>
                    <InputContainer>
                        <UploadItemContainer><FaCirclePlus size={20} /></UploadItemContainer>

                        <TextInput placeholder={`Message @${channel.recipients[0].displayName}`} />
                    </InputContainer>
                </ChatInputWrapper>
            </ChatContainer>
        </div>
    )
}