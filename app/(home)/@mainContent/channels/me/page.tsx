"use client"
import ContentHeader from "@/app/(home)/content-header";
import PrimaryButton from "@/components/primary-button/primary-button";
import styled from "styled-components";
import { FormEvent, Fragment, ReactNode, useEffect, useState } from "react";
import { UserStatus, UserStatusString } from "@/enums/user-status.enum";
import Relationship from "@/interfaces/dto/relationship.dto";
import { addFriend, getRelationships } from "@/services/relationships/relationships.service";
import { RelationshipType } from "@/enums/relationship-type.enum";
import TextInput from "@/components/text-input/text-input";
import UserAvatar from "@/components/user-avatar/user-avatar";
import RelationshipListItem from "../relationship-list-item";

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

interface TabItem<T> {
    id: string
    filter: (rel: Relationship) => boolean
    type: T
    show: () => boolean
    button: ReactNode
}

function AddFriendTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [usernameText, setUsernameText] = useState("");
    const [responseText, setResponseText] = useState<string | undefined>();
    const [responseSuccess, setResponseSuccess] = useState<boolean | undefined>();

    async function handleAddFriend(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setResponseText(undefined);
        setResponseSuccess(undefined);
        setIsLoading(true);
        const response = await addFriend(usernameText);
        setIsLoading(false);

        console.log(response)

        if (!response.success) {
            setResponseText(response.message as string);
            setResponseSuccess(false);
            return;
        }

        setResponseText(undefined);
        setResponseSuccess(true);

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
                            isLoading={isLoading}>
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
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [filteredRelationships, setFilteredRelationships] = useState<Relationship[]>([]);

    const filterButtons: TabItem<any>[] = [
        {
            id: "online",
            filter: (rel: Relationship) => rel.user.status !== UserStatus.Online && rel.type === RelationshipType.Friends,
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
            show: () => relationships.filter(rel => rel.type === RelationshipType.Pending || rel.type === RelationshipType.PendingReceived).length > 0,
            type: FriendsFilterButton,
            button: (
                <div className="flex items-center">
                    <p>Pending</p>
                    <FriendRequestCountText>{relationships.filter(rel => rel.type === RelationshipType.Pending || rel.type === RelationshipType.PendingReceived).length}</FriendRequestCountText>
                </div>
            )
        },
        {
            id: "add-friend",
            filter: (rel: Relationship) => false,
            show: () => true,
            type: PrimaryButton,
            button: <p>Add Friend</p>
        }
    ]

    const [activeTab, setActiveFilter] = useState<TabItem<any>>(filterButtons[0]);


    useEffect(() => {
        getRelationships().then(rel => {
            if (rel.success) {
                setRelationships(rel.data!);
            }
        })
    }, [])

    useEffect(() => {
        let rels = relationships;

        if (activeTab) {
            rels = rels.filter(activeTab.filter);
        }

        setFilteredRelationships(rels.filter(rel => rel.user.displayName.includes(searchText)));
    }, [activeTab, searchText])

    useEffect(() => {
        document.title = "Discord | Friends";
    }, [])

    // return (
    //     <div className="h-full flex flex-col">
    //         <div className="h-[200px] bg-blue-100 ">item</div>
    //         <div className="flex flex-col min-h-0">
    //             <div className="">item</div>
    //             <div className="overflow-scroll">
    //                 {(Array.from(Array(20).keys()).map(Number.call, Number)).map((item, index) => {
    //                     return <p className="py-5">{index}</p>
    //                 })}
    //             </div>
    //         </div>
    //     </div>
    // );

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
                                    <filterButton.type key={filterButton.id} onClick={() => setActiveFilter(filterButton)} className={`mx-[8px] ${activeTab.id === filterButton.id ? "active" : ""}`}>
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
                                                    <RelationshipListItem relationship={rel} key={rel.id} />);
                                            })}
                                        </Fragment>
                                    )}
                                {activeTab.id === "all" &&
                                    (
                                        <Fragment>
                                            <FilterTypeContainer>{`All friends — ${filteredRelationships.length}`}</FilterTypeContainer>
                                            {filteredRelationships.map((rel, index) => {
                                                return (
                                                    <RelationshipListItem relationship={rel} key={rel.id + index} />
                                                );
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
                                                    <RelationshipListItem relationship={rel} key={rel.id} />);
                                            })}
                                            {filteredRelationships.filter(rel => rel.type === RelationshipType.PendingReceived).length > 0 &&
                                                <FilterTypeContainer>{`Received — ${filteredRelationships.length}`}</FilterTypeContainer>}
                                            {filteredRelationships.filter(rel => rel.type === RelationshipType.PendingReceived).map((rel) => {
                                                return (
                                                    <RelationshipListItem relationship={rel} key={rel.id} />);
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