"use client"
import ContentHeader from "@/app/(home)/content-header";
import PrimaryButton from "@/components/primary-button/primary-button";
import styled from "styled-components";
import { FormEvent, Fragment, ReactNode, useEffect, useState } from "react";
import { UserStatus, UserStatusString } from "@/enums/user-status.enum";
import Relationship from "@/interfaces/relationship";
import { acceptFriendRequest, addFriend, declineFriendRequest, getRelationships } from "@/services/relationships/relationships.service";
import { RelationshipType } from "@/enums/relationship-type.enum";
import TextInput from "@/components/text-input/text-input";
import UserAvatar from "@/components/user-avatar/user-avatar";
import RelationshipListItem from "../relationship-list-item";
import { useAuth } from "@/contexts/auth.context";
import Tooltip from "@/components/tooltip/tooltip";
import { MdCheck, MdClose } from "react-icons/md";
import { IoMdMore } from "react-icons/io";
import { useCache } from "@/contexts/cache.context";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RELATIONSHIPS_CACHE } from "@/constants/cache";
import { useDMChannelsQuery } from "@/hooks/queries";
import { useRouter } from "next/navigation";
import { Channel } from "@/interfaces/channel";
import { createDMChannel } from "@/services/channels/channels.service";

const HeaderMain = styled.div`
    display: flex;
    align-items: center;
    height: 42px;
    color: var(--text-normal);
    font-size: 16px;
    font-weight: 500;
    border-radius: 4px;
`
const FriendsFilterButton = styled.div`
    font-weight: 500;
    display: flex;
    justify-content: center;
    padding: 4px 12px ;
    border-radius: 8px;
    line-height: 20px;
    min-height: 32px;
    align-items: center;
    cursor: pointer;
    &.active {
    background-color: var(--button-secondary);
    }
    
    &:hover {
    background-color: var(--button-secondary-hover);
    }
`

const IconContainer = styled.div`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    svg {
    flex-shrink: 0;
    width: 20px !important;
    height: 20px;
    }
`

const SearchBarContainer = styled.div`
    padding: 12px 24px;
`

const FriendRequestCountText = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 8px;
    background-color: var(--status-danger);
    width: 16px;
    height: 16px;
    text-align: center;
    border-radius: 50px;
    font-size: 12px;
    line-height: 1.333;
    font-weight: 700;
    padding-right: 1px;
`
const FilterTypeContainer = styled.div`
    padding: 16px 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--header-secondary);
    border-bottom: 1px solid var(--border-container);
    box-sizing: border-box;
    line-height: 1.28;
`

const FriendListContainer = styled.div`
    padding: 0 20px 0 24px;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    min-height: 0;

    &::-webkit-scrollbar {
        width: 12px;
    }

    &::-webkit-scrollbar-thumb {
        border: 3px solid rgba(0, 0, 0, 0);
        background-clip: padding-box;
        border-radius: 10px;
        background-color: #888;
    }

`

const AddFriendHeaderText = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: var(--header-primary);
    margin-bottom: 8px;
    line-height: 24px;
`

const AddFriendContainer = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    padding-right: 16px;
`

const AddFriendMascotContainer = styled.div`
    position: absolute;
    bottom: 100%;
    right: 0;
    padding-right: 16px;
`

const AddFriendInput = styled.input`
    width: 100%;
    background-color: var(--input-background);
    border: 1px solid var(--input-border);
    padding: 16px 10px;
    font-size: 16px;
    border-radius: 8px;
    min-height: 44px;
    line-height: 20px;
    min-width: 0;

    &:focus {
    outline: 1px solid var(--input-focused);
    }

    
    &.success {
    outline: 1px solid var(--text-positive);
    }

    &.error {
    outline: 1px solid var(--text-danger);
    }
`

const AddFriendTabContainer = styled.div`
    padding: 20px 30px;
    border-bottom: 1px solid var(--border-container);
`

const ResponseText = styled.p`
    font-size: 14px;
    margin-top: 8px;
    line-height: 20px;

    &.success {
        color: var(--text-positive);
    }

    &.error {
        color: var(--text-danger);
    }
`

const ActionContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    height: 100%;
`

const ActionButtonContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--background-secondary);
    border-radius: 100%;

    &.reject:hover {
        color: var(--text-danger);
    }

    &.accept:hover {
        color: var(--text-positive);
    }
`

function ActionButton({ className, children, onClick, tooltipText }: { className?: string, children?: ReactNode, onClick?: () => any, tooltipText: string }) {
    const [isHovering, setIsHovering] = useState(false)
    return (
        <ActionButtonContainer onClick={onClick} className={`relative ${className}`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            {children}
            <Tooltip position="top" show={isHovering} text={tooltipText} />
        </ActionButtonContainer>
    );
}

function MessageActionButton({ channel, relationship }: { channel?: Channel, relationship: Relationship }) {
    const router = useRouter();
    return (
        <ActionButton
            tooltipText="Message"
            onClick={async () => {
                if (!channel) {
                     await createDMChannel(relationship.user.id);
                     return;
                }
                router.push(`/channels/me/${channel.id}`)
            }}>
            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z"></path></svg>
        </ActionButton>
    );
}

interface TabItem<T> {
    id: string
    filter: (rel: Relationship) => boolean
    type: T
    show: () => boolean
    button: ReactNode
}

function AddFriendTab() {
    const [usernameText, setUsernameText] = useState("");
    const [responseText, setResponseText] = useState<string | undefined>();
    const [responseSuccess, setResponseSuccess] = useState<boolean | undefined>();
    const queryClient = useQueryClient();

    const { mutate: addFriendMutation, isPending, } = useMutation(
        {
            mutationFn: (username: string) => addFriend(username),
            onSuccess: (response) => {
                if (!response.success) {
                    setResponseText(response.message as string);
                    setResponseSuccess(false);
                    return;
                }

                setResponseText(undefined);
                setResponseSuccess(true);
                queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
                    if (!old) {
                        return [response.data!];
                    }
                    return [...old, response.data!];
                })

            },
            onError: (err) => {
                setResponseText("An error occurred while sending the friend request.");
                setResponseSuccess(false);
            }
        }
    );

    async function handleAddFriend(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setResponseText(undefined);
        setResponseSuccess(undefined);

        addFriendMutation(usernameText);
    }

    return (
        <AddFriendTabContainer>
            <AddFriendHeaderText>Add Friend</AddFriendHeaderText>
            <p>You can add friends with their Viscord username.</p>
            <form onSubmit={handleAddFriend}>
                <div className="relative mt-[16px]">
                    <AddFriendInput
                        className={`${responseSuccess !== undefined ? responseSuccess ? "success" : "error" : ""}`}
                        onChange={(e) => { setUsernameText(e.target.value) }}
                        value={usernameText}
                    >
                    </AddFriendInput>
                    <AddFriendContainer>
                        <PrimaryButton
                            className="h-[32px] items-center text-[14px]"
                            disabled={usernameText.length === 0}
                            isLoading={isPending}>
                            Send Friend Request
                        </PrimaryButton>
                    </AddFriendContainer>
                    <AddFriendMascotContainer>
                        <img src={"/add-friend-mascot.svg"} alt="" />
                    </AddFriendMascotContainer>
                </div>
                {responseSuccess !== undefined && responseSuccess && <ResponseText className="success">Success! Your friend request to <strong className="font-medium">{usernameText}</strong> was sent.</ResponseText>}
                {responseSuccess !== undefined && !responseSuccess && <ResponseText className="error">{responseText}</ResponseText>}
            </form>
        </AddFriendTabContainer>
    );

}

export default function FriendListPage() {
    const [searchText, setSearchText] = useState('');
    const [filteredRelationships, setFilteredRelationships] = useState<Relationship[]>([]);
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: channels } = useDMChannelsQuery();
    const { data: relationships } = useQuery({
        staleTime: Infinity,
        queryKey: [RELATIONSHIPS_CACHE],
        queryFn: async () => {
            const res = await getRelationships();
            if (res.success) {
                return res.data!;
            }
            return [];
        }
    })



    const filterButtons: TabItem<any>[] = [
        {
            id: "online",
            filter: (rel: Relationship) => rel.user.isOnline && rel.type === RelationshipType.Friends,
            show: () => true,
            type: FriendsFilterButton,
            button:
                <p>Online</p>
        },
        {
            id: "all",
            filter: (rel: Relationship) => rel.type === RelationshipType.Friends,
            show: () => true,
            type: FriendsFilterButton,
            button: (
                <p>All</p>
            )
        },
        {
            id: "pending",
            filter: (rel: Relationship) => rel.type === RelationshipType.Pending || rel.type === RelationshipType.PendingReceived,
            show: () => relationships !== undefined && relationships!.filter(rel => rel.type === RelationshipType.Pending || rel.type === RelationshipType.PendingReceived).length > 0,
            type: FriendsFilterButton,
            button: (
                <div className="flex items-center">
                    <p>Pending</p>
                    {relationships && relationships!.filter(rel => rel.type === RelationshipType.PendingReceived).length > 0 &&
                        <FriendRequestCountText>{relationships!.filter(rel => rel.type === RelationshipType.PendingReceived).length}</FriendRequestCountText>
                    }
                </div>
            )
        },
        {
            id: "add-friend",
            filter: (rel: Relationship) => false,
            show: () => true,
            type: PrimaryButton,
            button: <p className="whitespace-nowrap">Add Friend</p>
        }
    ]

    const [activeTab, setActiveTab] = useState<TabItem<any>>(filterButtons[0]);
    const { mutate: declineRequestMutation } = useMutation(
        {
            mutationFn: (relationship: Relationship) => handleDecline(relationship)
        }
    );

    const { mutate: acceptRequestMutation } = useMutation(
        {
            mutationFn: (relationship: Relationship) => acceptFriendRequest(relationship.id)
        }
    );

    async function handleAccept(relationship: Relationship) {
        const response = await acceptFriendRequest(relationship.id);

        if (!response.success) return;
        queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
            if (!old) {
                return [relationship];
            }
            return old.map((rel) =>
                rel.id === relationship.id ? { ...rel, type: RelationshipType.Friends } : rel
            );
        })
    }

    async function handleDecline(relationship: Relationship) {
        const response = await declineFriendRequest(relationship.id);

        if (!response.success) return; //might wanna handle this error.

        queryClient.setQueryData<Relationship[]>([RELATIONSHIPS_CACHE], (old) => {
            if (!old) {
                return [];
            }
            return old.filter(rel => rel.id !== relationship.id);
        })


    }


    useEffect(() => {
        if (!relationships) return;
        let rels = relationships;

        if (activeTab) {
            rels = rels.filter(activeTab.filter);
        }
        rels = rels.filter(rel => rel.user.displayName.includes(searchText));
        setFilteredRelationships(rels);

        if (activeTab.id === 'pending' && rels.length === 0) {
            setActiveTab(filterButtons.find(f => f.id === 'all') || filterButtons[0]);
        }

    }, [activeTab, searchText, relationships])

    useEffect(() => {
        document.title = "Viscord | Friends";
    }, [])

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0">
                <ContentHeader>
                    <div className="flex items-center">
                        <HeaderMain className="mr-[12px]">
                            <IconContainer>
                                <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="29" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M13 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path><path fill="currentColor" d="M3 5v-.75C3 3.56 3.56 3 4.25 3s1.24.56 1.33 1.25C6.12 8.65 9.46 12 13 12h1a8 8 0 0 1 8 8 2 2 0 0 1-2 2 .21.21 0 0 1-.2-.15 7.65 7.65 0 0 0-1.32-2.3c-.15-.2-.42-.06-.39.17l.25 2c.02.15-.1.28-.25.28H9a2 2 0 0 1-2-2v-2.22c0-1.57-.67-3.05-1.53-4.37A15.85 15.85 0 0 1 3 5Z"></path></svg>
                            </IconContainer>
                            <p className="leading-[24px]">Friends</p>
                        </HeaderMain>
                        <div className="mx-[4px]">
                            <svg className="text-[var(--background-mod-strong)]" aria-hidden="true" role="img" width="4" height="4" viewBox="0 0 4 4"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></svg>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {
                            filterButtons.map((filterButton) => {
                                if (!filterButton.show()) return;
                                return (
                                    <filterButton.type key={filterButton.id} onClick={() => setActiveTab(filterButton)} className={`mx-[8px] ${activeTab.id === filterButton.id ? "active" : ""}`}>
                                        {filterButton.button}
                                    </filterButton.type>
                                );
                            })
                        }
                    </div>
                </ContentHeader>
            </div>
            <div className="flex flex-col min-h-0">
                <div className="w-full flex flex-col min-h-0">
                    {activeTab.id === 'add-friend' ?
                        <AddFriendTab />
                        :
                        <Fragment>
                            <SearchBarContainer>
                                <TextInput
                                    label=""
                                    value={searchText}
                                    onChange={(val) => setSearchText(val)}
                                />
                            </SearchBarContainer>
                            <FriendListContainer>
                                {activeTab.id === "online" &&
                                    (
                                        <Fragment>
                                            <FilterTypeContainer>{`Online — ${filteredRelationships.length}`}</FilterTypeContainer>
                                            {filteredRelationships.map((rel) => {
                                                return (
                                                    <RelationshipListItem relationship={rel} key={rel.id}>
                                                        {rel.type === RelationshipType.Pending &&
                                                            <ActionContainer>
                                                                <ActionButton onClick={() => acceptRequestMutation(rel)} className="accept" tooltipText="Accept">
                                                                    <MdCheck size={20} />
                                                                </ActionButton>
                                                                <ActionButton onClick={() => declineRequestMutation(rel)} className="reject" tooltipText="Decline">
                                                                    <MdClose size={20} />
                                                                </ActionButton>
                                                            </ActionContainer>
                                                        }
                                                        {rel.type === RelationshipType.Friends &&
                                                            <ActionContainer>
                                                                <MessageActionButton channel={channels ? channels.find(ch => ch.recipients[0].id === rel.user.id) : undefined} />
                                                                <ActionButton tooltipText="More">
                                                                    <IoMdMore size={20} />
                                                                </ActionButton>
                                                            </ActionContainer>
                                                        }

                                                    </RelationshipListItem>);
                                            })}
                                        </Fragment>
                                    )}
                                {activeTab.id === "all" &&
                                    (
                                        <Fragment>
                                            <FilterTypeContainer>{`All friends — ${filteredRelationships.length}`}</FilterTypeContainer>
                                            {filteredRelationships.map((rel, index) => {
                                                return (
                                                    <RelationshipListItem relationship={rel} key={rel.id}>
                                                        {rel.type === RelationshipType.Pending &&
                                                            <ActionContainer>
                                                                <ActionButton onClick={() => handleAccept(rel)} className="accept" tooltipText="Accept">
                                                                    <MdCheck size={20} />
                                                                </ActionButton>
                                                                <ActionButton onClick={() => handleDecline(rel)} className="reject" tooltipText="Decline">
                                                                    <MdClose size={20} />
                                                                </ActionButton>
                                                            </ActionContainer>
                                                        }
                                                        {rel.type === RelationshipType.Friends &&
                                                            <ActionContainer>
                                                                <MessageActionButton relationship={rel} channel={channels ? channels.find(ch => ch.recipients[0].id === rel.user.id) : undefined} />
                                                                <ActionButton tooltipText="More">
                                                                    <IoMdMore size={20} />
                                                                </ActionButton>
                                                            </ActionContainer>
                                                        }

                                                    </RelationshipListItem>);
                                            })}
                                        </Fragment>
                                    )}
                                {activeTab.id === "pending" &&
                                    (
                                        <Fragment>
                                            {filteredRelationships.filter(rel => rel.type === RelationshipType.Pending).length > 0 &&
                                                <FilterTypeContainer>{`Sent — ${filteredRelationships.length}`}</FilterTypeContainer>}
                                            {filteredRelationships.filter(rel => rel.type === RelationshipType.Pending).map((rel) => {
                                                return (
                                                    <RelationshipListItem relationship={rel} key={rel.id}>
                                                        {rel.type === RelationshipType.Pending &&
                                                            <ActionContainer>
                                                                <ActionButton onClick={() => handleAccept(rel)} className="accept" tooltipText="Accept">
                                                                    <MdCheck size={20} />
                                                                </ActionButton>
                                                                <ActionButton onClick={() => handleDecline(rel)} className="reject" tooltipText="Decline">
                                                                    <MdClose size={20} />
                                                                </ActionButton>
                                                            </ActionContainer>
                                                        }
                                                        {rel.type === RelationshipType.Friends &&
                                                            <ActionContainer>
                                                                <MessageActionButton channel={channels ? channels.find(ch => ch.recipients[0].id === rel.user.id) : undefined} />
                                                                <ActionButton tooltipText="More">
                                                                    <IoMdMore size={20} />
                                                                </ActionButton>
                                                            </ActionContainer>
                                                        }

                                                    </RelationshipListItem>);
                                            })}
                                            {filteredRelationships.filter(rel => rel.type === RelationshipType.PendingReceived).length > 0 &&
                                                <FilterTypeContainer>{`Received — ${filteredRelationships.length}`}</FilterTypeContainer>}
                                            {filteredRelationships.filter(rel => rel.type === RelationshipType.PendingReceived).map((rel) => {
                                                return (
                                                    <RelationshipListItem relationship={rel} key={rel.id}>
                                                        {rel.type === RelationshipType.PendingReceived &&
                                                            <ActionContainer>
                                                                <ActionButton onClick={() => handleAccept(rel)} className="accept" tooltipText="Accept">
                                                                    <MdCheck size={20} />
                                                                </ActionButton>
                                                                <ActionButton onClick={() => handleDecline(rel)} className="reject" tooltipText="Decline">
                                                                    <MdClose size={20} />
                                                                </ActionButton>
                                                            </ActionContainer>
                                                        }
                                                        {rel.type === RelationshipType.Friends &&
                                                            <ActionContainer>
                                                                <MessageActionButton channel={channels ? channels.find(ch => ch.recipients[0].id === rel.user.id) : undefined} />
                                                                <ActionButton tooltipText="More">
                                                                    <IoMdMore size={20} />
                                                                </ActionButton>
                                                            </ActionContainer>
                                                        }

                                                    </RelationshipListItem>);
                                            })}

                                        </Fragment>
                                    )}
                            </FriendListContainer>
                        </Fragment>
                    }
                </div>

                <div className="">

                </div>
            </div>
        </div>
    )
}