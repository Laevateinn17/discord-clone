"use client"
import ContentHeader from "@/app/(home)/content-header";
import PrimaryButton from "@/components/primary-button/primary-button";
import Relationship from "@/interfaces/dto/relationship.dto";
import { getRelationships } from "@/services/relationships/relationships.service";
import { useEffect, useState } from "react";
import styled from "styled-components";

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
        margin-right: 4px;
        svg {
        flex-shrink: 0;
        width: 20px !important;
        height: 20px;
        }
`

export default function FriendListPage() {


    return (
        <div className="w-100">
            <ContentHeader>
                <div className="flex items-center ">
                    <HeaderMain>
                        <IconContainer>
                            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="29" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M13 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path><path fill="currentColor" d="M3 5v-.75C3 3.56 3.56 3 4.25 3s1.24.56 1.33 1.25C6.12 8.65 9.46 12 13 12h1a8 8 0 0 1 8 8 2 2 0 0 1-2 2 .21.21 0 0 1-.2-.15 7.65 7.65 0 0 0-1.32-2.3c-.15-.2-.42-.06-.39.17l.25 2c.02.15-.1.28-.25.28H9a2 2 0 0 1-2-2v-2.22c0-1.57-.67-3.05-1.53-4.37A15.85 15.85 0 0 1 3 5Z"></path></svg>
                        </IconContainer>
                        <p className="mr-[8px] leading-[24px]">Friends</p>
                    </HeaderMain>
                    <div className="mx-[4px]">
                        <svg className="text-[var(--background-mod-strong)]" aria-hidden="true" role="img" width="4" height="4" viewBox="0 0 4 4"><circle cx="2" cy="2" r="2" fill="currentColor"></circle></svg>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <FriendsFilterButton>
                        <p>Online</p>
                    </FriendsFilterButton>
                    <FriendsFilterButton>
                        <p>All</p>
                    </FriendsFilterButton>
                    <PrimaryButton>
                        <p>Add Friend</p>
                    </PrimaryButton>
                </div>
            </ContentHeader>
            this is friends page
        </div>
    )
}