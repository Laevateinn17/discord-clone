import ContentHeader from "@/app/(app)/content-header";
import { useVoiceEvents } from "@/app/(auth)/hooks/socket-events";
import { useAppSettingsStore } from "@/app/stores/app-settings-store";
import { useCurrentUserStore } from "@/app/stores/current-user-store";
import { useMediasoupStore } from "@/app/stores/mediasoup-store";
import { useUserProfileStore } from "@/app/stores/user-profiles-store";
import { useIsUserTyping } from "@/app/stores/user-typing-store";
import { useGetChannelVoiceRing } from "@/app/stores/voice-ring-state-store";
import { useGetChannelVoiceStates } from "@/app/stores/voice-state-store";
import Tooltip from "@/components/tooltip/tooltip";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { ChannelType } from "@/enums/channel-type.enum";
import { VoiceEventType } from "@/enums/voice-event-type";
import { Channel } from "@/interfaces/channel";
import { UserProfile } from "@/interfaces/user-profile";
import { VoiceState } from "@/interfaces/voice-state";
import { ringChannelRecipients } from "@/services/channels/channels.service";
import { Consumer, Producer } from "mediasoup-client/types";
import { ReactNode, useEffect, useRef, useState } from "react";
import { BsMicFill, BsMicMuteFill, BsPinAngleFill } from "react-icons/bs";
import { LuHeadphoneOff, LuScreenShare, LuScreenShareOff } from "react-icons/lu";
import { MdGroupAdd } from "react-icons/md";
import { PiPhoneCallFill, PiVideoCameraFill } from "react-icons/pi";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { getImageURL } from "@/services/storage/storage.service";
import { ContentFooter } from "@/app/(app)/content-footer";
import { ImPhoneHangUp } from "react-icons/im";
import { VoiceRingState } from "@/interfaces/voice-ring-state";
import ColorThief from "colorthief";


const UserProfileHeader = styled.div`
    display: flex;
    align-items: center;
    max-height: auto;
    flex-grow: 1;
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

const HeaderActionContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 32px;
    height: 32px;
    cursor: pointer;
    color: var(--interactive-normal);

    &:hover {
        color: var(--interactive-hover);
    }
`

const CallHeaderContainer = styled.div`
    display: flex;
    width: 100%;
    background: black;
    flex-direction: column;
    overflow: hidden;
`

function HeaderActionButton({ children, onClick, tooltipText }: { children: ReactNode, onClick?: () => any, tooltipText: string }) {
    const [isHovering, setIsHovering] = useState(false);


    return (
        <HeaderActionContainer
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={onClick}>
            {children}
            <Tooltip position="bottom" show={isHovering} text={tooltipText} fontSize="14px" />
        </HeaderActionContainer>
    )
}

function SearchBar({ channel }: { channel: Channel }) {
    return <input />;
}

const AvatarImage = styled.img`
    width: 80px;
    height: 80px;
    cursor: pointer;
    border-radius: 50%;
`

function MutedIcon() {
    return (
        <div className="absolute bottom-0 right-0 rounded-full bg-[var(--status-danger)] p-1 border-[4px] border-black border-solid translate-y-1/4">
            <BsMicMuteFill size={12} />
        </div>
    )
}

function DeafenedIcon() {
    return (
        <div className="absolute bottom-0 right-0 rounded-full bg-[var(--status-danger)] p-1 border-[4px] border-black border-solid translate-y-1/4">
            <LuHeadphoneOff size={12} />
        </div>
    )
}

const CallActionsGroup = styled.div`
    background-color: var(--background-surface-high);
    border: 1px solid var(--border-faint);
    border-radius: 12px;
    gap: 8px;
    padding: 4px;
    display: flex;
`;

const CallActionButton = styled.button`
    padding: 10px;
    border-radius: 8px;
    &:hover {
    background-color: var(--background-modifier-hover);
    }
`

const HeaderBottomGradient = styled.div`
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0) 20%,
        rgba(0, 0, 0, 0.03) 40%,
        rgba(0, 0, 0, 0.08) 55%,
        rgba(0, 0, 0, 0.18) 70%,
        rgba(0, 0, 0, 0.35) 85%,
        rgba(0, 0, 0, 0.6) 100%
    );
    position: absolute;
    height: 160px;
    width: 100%;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: end;
    pointer-events: none;
    
    opacity: 0;
    transform: translateY(20%);
    transition: all 200ms ease-in-out;
    
    & * {
        pointer-events: auto;
    }
    
    &.active {
        opacity: 1;
        transform: translateY(0);
    }
`

const TileText = styled.div`
    background-color: var(--overlay-text-background);
    border-radius: 4px;
    display: flex;
    padding: 8px;
`
const Tile = styled.div`
    min-width: 200px;
    display: flex;
    flex-grow: 1;
    min-height: 150px;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    overflow: hidden;
`
const Overlay = styled.div`
    width: 100%;
    height: 100%;
    padding: 8px;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
`
function UserTile({ user, showDisplayName, isSpeaking }: { user: UserProfile, showDisplayName: boolean, isSpeaking: boolean }) {
    const imgRef = useRef<HTMLImageElement>(null!);
    const [bannerColor, setBannerColor] = useState<string | null>();
    const avatarURL = user.avatarURL ? getImageURL('avatars', user.avatarURL) : getImageURL('assets', user.defaultAvatarURL);
    async function getBannerColor() {
        const img = imgRef.current;
        if (!img) return;
        try {
            const colorThief = new ColorThief();
            const result = colorThief.getColor(img);
            const rgb = `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
            setBannerColor(rgb);
        } catch (err) {
            console.error('Color extraction failed:', err);
        }
    }
    return (
        <div
            className="w-full h-full flex items-center justify-center p-[8px] relative"
            style={{ backgroundColor: bannerColor ?? 'gray' }}
        >
            <img
                src={avatarURL}
                ref={imgRef}
                style={{ display: 'none' }}
                crossOrigin="anonymous"
                alt="avatar"
                onLoad={() => getBannerColor()}
            />
            <AvatarImage crossOrigin="anonymous" className={`${isSpeaking ? 'ring-2 ring-green-500 p-[1px]' : ''}`} src={avatarURL} />
            <Overlay>
                {showDisplayName &&
                    <TileText>
                        {user.displayName}
                    </TileText>
                }
            </Overlay>
        </div>
    )
}

function CallHeader({ channel }: { channel: Channel }) {
    const [isHoveringName, setIsHoveringName] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const voiceRings = useGetChannelVoiceRing(channel.id);
    const { user } = useCurrentUserStore();
    const { activeSpeakers, startScreenShare, resumeConsumer, pauseConsumer, stopScreenShare, producers, consumers } = useMediasoupStore();
    const { emitVoiceEvent } = useVoiceEvents();
    const { mediaSettings, setMuted } = useAppSettingsStore();
    const screenShareConsumers = Array.from(consumers.values()).filter(c => c.appData.mediaTag === 'screen');
    const screenShareProducer = Array.from(producers.values()).find(c => c.appData.mediaTag === 'screen');
    const [activeStream, setActiveStream] = useState<Consumer | undefined>();
    const activeStreamVideoRef = useRef<HTMLVideoElement>(null!);
    const producerVideoRef = useRef<HTMLVideoElement>(null!);
    const [focusedCard, setFocusedCard] = useState<ReactNode | undefined>();
    const voiceStates = useGetChannelVoiceStates(channel.id);
    const { getUserProfile } = useUserProfileStore();
    const recipient: UserProfile = getUserProfile(channel.recipients[0].id) || channel.recipients[0];
    const isTyping = useIsUserTyping(channel.id, recipient.id);
    const tiles = [...screenShareConsumers,
    ...(screenShareProducer ? [screenShareProducer] : []),
    ...Array.from(voiceRings),
    ...Array.from(voiceStates),
    ];

    async function handleJoinVoiceCall() {
        if (voiceStates.length === 0) await ringChannelRecipients(channel.id);
        emitVoiceEvent(channel.id, VoiceEventType.VOICE_JOIN, {
            isMuted: mediaSettings.isMuted,
            isDeafened: mediaSettings.isDeafened
        } as VoiceState)
    }

    async function handleLeaveVoiceCall() {
        emitVoiceEvent(channel.id, VoiceEventType.VOICE_LEAVE)
    }

    useEffect(() => {
        if (channel.type === ChannelType.DM && screenShareConsumers.length > 0) {
            const consumer = screenShareConsumers[0];
            if (consumer.paused) {
                resumeConsumer(consumer.id);
            }
            setActiveStream(consumer)
        }
    }, [screenShareConsumers]);

    useEffect(() => {
        if (!screenShareProducer) return;
        const stream = new MediaStream([screenShareProducer.track!]);
        producerVideoRef.current.srcObject = stream;
    }, [screenShareProducer])

    useEffect(() => {
        if (!activeStream) return;
        const stream = new MediaStream([activeStream.track]);
        console.log('current active stream ref', activeStreamVideoRef.current);
        activeStreamVideoRef.current.srcObject = stream;
    }, [activeStream])


    return (
        <CallHeaderContainer
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}>
            <ContentHeader hide={!isHovering}>
                <UserProfileHeader>
                    <div className="ml-[4px] mr-[8px]">
                        <UserAvatar user={recipient} size="24" isTyping={isTyping} />
                    </div>
                    <UserProfileHeaderTextContainer onMouseEnter={() => setIsHoveringName(true)} onMouseLeave={() => setIsHoveringName(false)}>
                        <UserProfileHeaderText>
                            {recipient.displayName}
                        </UserProfileHeaderText>
                        <Tooltip
                            position="bottom"
                            show={isHoveringName}
                            text={recipient.username}
                            fontSize="14px" />
                    </UserProfileHeaderTextContainer>
                </UserProfileHeader>
                <div className="flex items-center text-[var(--interactive-normal)] gap-[8px]">
                    <HeaderActionButton tooltipText="Join Voice Call" onClick={handleJoinVoiceCall}><PiPhoneCallFill size={20} /></HeaderActionButton>
                    <HeaderActionButton tooltipText="Start Video Call"><PiVideoCameraFill size={20} /></HeaderActionButton>
                    <HeaderActionButton tooltipText="Pinned Message"><BsPinAngleFill size={20} /></HeaderActionButton>
                    <HeaderActionButton tooltipText="Add Friends to DM"><MdGroupAdd size={20} /></HeaderActionButton>
                    <SearchBar channel={channel} />
                </div>
            </ContentHeader>
            {focusedCard ?
                <div className="flex items-center justify-center relative w-1/2 bg-black">
                    {focusedCard}
                </div>
                :
                <div className="flex justify-center items-center gap-3 my-[16px] w-full px-[12px] py-[8px]">
                    {screenShareConsumers.length > 0 || screenShareProducer ?
                        <div className="flex flex-wrap gap-4 w-full h-full">
                            {tiles.map(val => {
                                if (val instanceof Consumer) {
                                    console.log('consumer tile', tiles)
                                    return (
                                        <div key={val.id} className="min-w-[200px] flex-1 min-h-[150px]">
                                            <video
                                                ref={activeStream?.id === val.id ? activeStreamVideoRef : undefined}
                                                className="w-full h-full object-cover rounded-lg bg-black"
                                                autoPlay
                                            />
                                        </div>
                                    )
                                }
                                else if (val instanceof Producer) {
                                    return (
                                        <div key={val.id} className="min-w-[200px] flex-1 min-h-[150px]">
                                            <video
                                                ref={producerVideoRef}
                                                className="w-full h-full object-cover rounded-lg bg-black"
                                                autoPlay
                                            />
                                        </div>
                                    )
                                }
                                else if (val instanceof VoiceRingState) {
                                    const user = getUserProfile(val.recipientId);
                                    const isSpeaking = (voiceStates.find(vs => vs.userId === val.recipientId) && activeSpeakers.has(val.recipientId)) ?? false;
                                    if (user) {
                                        return (
                                            <Tile key={user.id}>
                                                {user && <UserTile user={user} isSpeaking={isSpeaking} showDisplayName={isHovering} />}
                                            </Tile>
                                        );
                                    }
                                }
                                else if (val instanceof VoiceState) {
                                    const user = getUserProfile(val.userId);
                                    const isSpeaking = (voiceStates.find(vs => vs.userId === val.userId) && activeSpeakers.has(val.userId)) ?? false;
                                    if (user) {
                                        return (
                                            <Tile key={user.id}>
                                                {user && <UserTile user={user} isSpeaking={isSpeaking} showDisplayName={isHovering} />}
                                            </Tile>
                                        );
                                    }
                                }
                            })}
                        </div>

                        :
                        <AnimatePresence>
                            {voiceRings.map(vr => {
                                const user = getUserProfile(vr.recipientId);
                                return (
                                    <motion.div
                                        key={vr.recipientId}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {user && <AvatarImage className="brightness-50" src={user.avatarURL ? getImageURL('avatars', user.avatarURL) : getImageURL('assets', user.defaultAvatarURL)} />}
                                    </motion.div>
                                );
                            })}
                            {voiceStates.map((vs) => {
                                const participant = getUserProfile(vs.userId);
                                const isSpeaking = voiceStates.find(vs => vs.userId === user.id) && activeSpeakers.has(vs.userId);
                                return (
                                    <motion.div
                                        key={vs.userId}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative"
                                    >
                                        {participant &&
                                            <>
                                                <AvatarImage className={`${isSpeaking ? 'ring-2 ring-green-500 p-[1px]' : ''}`} src={participant.avatarURL ? getImageURL('avatars', participant.avatarURL) : getImageURL('assets', participant.defaultAvatarURL)} />
                                                {vs.isDeafened ? <DeafenedIcon /> : vs.isMuted && <MutedIcon />}
                                            </>
                                        }
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    }
                </div>
            }
            {
                (activeStream || screenShareProducer) ?
                    <HeaderBottomGradient className={`${isHovering ? 'active' : ''}`}>
                        <ContentFooter hide={false}>
                            {voiceStates.find(vs => vs.userId === user.id) &&
                                <CallActionsGroup>
                                    <CallActionButton className={`${mediaSettings.isMuted ? 'bg-[var(--opacity-red-12)]' : ''}`}
                                        onClick={() => setMuted(!mediaSettings.isMuted)}>
                                        <div className="h-[20px] w-[20px] flex items-center justify-center">
                                            {mediaSettings.isMuted ? <BsMicMuteFill className="text-[var(--red-400)]" size={18} /> : <BsMicFill size={18} />}
                                        </div>
                                    </CallActionButton >
                                    {screenShareProducer ?
                                        <CallActionButton onClick={stopScreenShare} className="bg-[var(--opacity-green-12)]">
                                            <div className="h-[20px] w-[20px] flex items-center justify-center">
                                                <LuScreenShareOff className="text-[var(--green-300)]" size={18} />
                                            </div >
                                        </CallActionButton >
                                        :
                                        <CallActionButton onClick={startScreenShare}>
                                            <div className="h-[20px] w-[20px] flex items-center justify-center">
                                                <LuScreenShare size={18} />
                                            </div >
                                        </CallActionButton >
                                    }

                                </CallActionsGroup >
                            }
                            <div className="">
                                {voiceStates.find(vs => vs.userId === user?.id) ?
                                    (<button className="p-[10px] bg-[var(--status-danger)] rounded-lg" onClick={handleLeaveVoiceCall}>
                                        <div className="px-[12px] py-[4px]">
                                            <ImPhoneHangUp className="" size={18} />
                                        </div>
                                    </button>)
                                    :
                                    (<button className="p-[10px] bg-[var(--status-positive)] rounded-lg" onClick={handleJoinVoiceCall}>
                                        <div className="px-[12px] py-[4px]">
                                            <PiPhoneCallFill className="" size={18} />
                                        </div>
                                    </button>)
                                }
                            </div>
                        </ContentFooter >
                    </HeaderBottomGradient >
                    :
                    <ContentFooter hide={false}>
                        {voiceStates.find(vs => vs.userId === user.id) &&
                            <CallActionsGroup>
                                <CallActionButton className={`${mediaSettings.isMuted ? 'bg-[var(--opacity-red-12)]' : ''}`}
                                    onClick={() => setMuted(!mediaSettings.isMuted)}>
                                    <div className="h-[20px] w-[20px] flex items-center justify-center">
                                        {mediaSettings.isMuted || mediaSettings.isDeafened ? <BsMicMuteFill className="text-[var(--red-400)]" size={18} /> : <BsMicFill size={18} />}
                                    </div>
                                </CallActionButton>
                                <CallActionButton>
                                    <div className="h-[20px] w-[20px] flex items-center justify-center">
                                        <LuScreenShare size={18} onClick={startScreenShare} />
                                    </div>
                                </CallActionButton>

                            </CallActionsGroup>
                        }
                        <div className="">
                            {voiceStates.find(vs => vs.userId === user?.id) ?
                                (<button className="p-[10px] bg-[var(--status-danger)] rounded-lg" onClick={handleLeaveVoiceCall}>
                                    <div className="px-[12px] py-[4px]">
                                        <ImPhoneHangUp className="" size={18} />
                                    </div>
                                </button>)
                                :
                                (<button className="p-[10px] bg-[var(--status-positive)] rounded-lg" onClick={handleJoinVoiceCall}>
                                    <div className="px-[12px] py-[4px]">
                                        <PiPhoneCallFill className="" size={18} />
                                    </div>
                                </button>)
                            }
                        </div>
                    </ContentFooter>
            }
        </CallHeaderContainer >
    )
}



export function DMChannelHeader({ channel }: { channel: Channel }) {
    const [isHoveringName, setIsHoveringName] = useState(false);
    const { getUserProfile } = useUserProfileStore();
    const recipient: UserProfile = getUserProfile(channel.recipients[0].id) || channel.recipients[0];
    const isTyping = useIsUserTyping(channel.id, recipient.id);
    const voiceStates = useGetChannelVoiceStates(channel.id);
    const { emitVoiceEvent } = useVoiceEvents();
    const { mediaSettings } = useAppSettingsStore();

    async function handleJoinVoiceCall() {
        if (voiceStates.length === 0) await ringChannelRecipients(channel.id);
        emitVoiceEvent(channel.id, VoiceEventType.VOICE_JOIN, {
            isMuted: mediaSettings.isMuted,
            isDeafened: mediaSettings.isDeafened
        } as VoiceState)
    }

    if (voiceStates.length > 0) {
        return <CallHeader channel={channel} />
    }

    return (
        <ContentHeader>
            <UserProfileHeader>
                <div className="ml-[4px] mr-[8px]">
                    <UserAvatar user={recipient} size="24" isTyping={isTyping} />
                </div>
                <UserProfileHeaderTextContainer onMouseEnter={() => setIsHoveringName(true)} onMouseLeave={() => setIsHoveringName(false)}>
                    <UserProfileHeaderText>
                        {recipient.displayName}
                    </UserProfileHeaderText>
                    <Tooltip
                        position="bottom"
                        show={isHoveringName}
                        text={recipient.username}
                        fontSize="14px" />
                </UserProfileHeaderTextContainer>
            </UserProfileHeader>
            <div className="flex items-center text-[var(--interactive-normal)] gap-[8px]">
                <HeaderActionButton tooltipText={"Start Voice Call"} onClick={handleJoinVoiceCall}><PiPhoneCallFill size={20} /></HeaderActionButton>
                <HeaderActionButton tooltipText="Start Video Call"><PiVideoCameraFill size={20} /></HeaderActionButton>
                <HeaderActionButton tooltipText="Pinned Message"><BsPinAngleFill size={20} /></HeaderActionButton>
                <HeaderActionButton tooltipText="Add Friends to DM"><MdGroupAdd size={20} /></HeaderActionButton>
                <SearchBar channel={channel} />
            </div>
        </ContentHeader>

    )
}
