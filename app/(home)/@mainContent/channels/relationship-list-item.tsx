"use client"
import Tooltip from "@/components/tooltip/tooltip";
import UserAvatar from "@/components/user-avatar/user-avatar";
import { RelationshipType } from "@/enums/relationship-type.enum";
import { UserStatusString } from "@/enums/user-status.enum";
import Relationship from "@/interfaces/dto/relationship.dto";
import { acceptFriendRequest, declineFriendRequest } from "@/services/relationships/relationships.service";
import { ReactNode, useState } from "react";
import { IoMdMore } from "react-icons/io";
import { MdCheck, MdClose, MdMore } from "react-icons/md";
import styled from "styled-components";

const UserListItemContainer = styled.div`
    min-height: 62px;
    border-bottom: 1px solid var(--border-container);
`

const UserListItemWrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 1px 16px;
    border-radius: 8px;
    height: 100%;
    transition: background-color 100ms linear;
    cursor: pointer;

    &:hover {
    background-color: var(--background-mod-subtle);
    }

`



const UserInfoContainer = styled.div`
    line-height: 20px;
    font-size: 14px;
`

const UsernameText = styled.div`
    line-height: 16px;
    margin-left: 5px;
    color: var(--header-secondary);
    display: none;
    visibility: none;

    &.active {
        display: block;
        visibility: visible;
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
    const [isHovering, setIsHovering] = useState(false);

    return (
        <ActionButtonContainer
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={onClick}
            className={`relative ${className}`}>
            {children}
            <Tooltip position="top" show={isHovering} text={tooltipText} />
        </ActionButtonContainer>);
}

export default function RelationshipListItem({ relationship }: { relationship: Relationship }) {
    const [isHovering, setIsHovering] = useState(false);

    async function handleAccept() {
        const response = await acceptFriendRequest(relationship.id);
    }

    async function handleDecline() {
        const response = await declineFriendRequest(relationship.id);
    }

    return (
        <UserListItemContainer>
            <UserListItemWrapper
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}>
                <div className="flex items-center flex-1">
                    <div className="mr-[12px] bg-inherit">
                        <UserAvatar user={relationship.user} />
                    </div>
                    <UserInfoContainer>
                        <div className="flex items-center">
                            <p className="text-base leading-[20px] font-semibold">{relationship.user.displayName}</p>
                            <UsernameText className={`${isHovering ? "active" : ""}`}>{relationship.user.username}</UsernameText>
                        </div>
                        <p className="">{UserStatusString[relationship.user.status]}</p>
                    </UserInfoContainer>
                </div>
                {relationship.type === RelationshipType.PendingReceived &&
                    <ActionContainer>
                        <ActionButton
                            onClick={handleAccept}
                            className="accept"
                            tooltipText="Accept">
                            <MdCheck size={20} />
                        </ActionButton>
                        <ActionButton
                        onClick={handleDecline}
                            className="reject"
                            tooltipText="Decline">
                            <MdClose size={20} />
                        </ActionButton>
                    </ActionContainer>
                }
                {relationship.type === RelationshipType.Friends &&
                    <ActionContainer>
                        <ActionButton tooltipText="Message" onClick={() => { }}>
                            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z"></path></svg>
                        </ActionButton>
                        <ActionButton tooltipText="More">
                            <IoMdMore size={20} />
                        </ActionButton>
                    </ActionContainer>
                }
            </UserListItemWrapper>
        </UserListItemContainer>
    )
}
