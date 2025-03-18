"use client"

import SidebarContentContainer from "@/components/guild-sidebar/sidebar-content-container";
import SidebarHeader from "@/components/guild-sidebar/sidebar-header";
import { ChannelType } from "@/enums/channel-type.enum";
import { useGuildDetailQuery } from "@/hooks/queries";
import { Channel } from "@/interfaces/channel";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import styled from "styled-components";
import { ChannelCategory } from "./channel-category";
import { Router } from "next/router";

const HeaderContainer = styled.div`
    padding: 12px 8px 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;

    transition: background-color 100ms linear;

    &:hover {
        background-color: var(--background-modifier-hover);
    }
`

const HeaderText = styled.p`
    color: var(--text-default);
    line-height: 1.25;
    font-weight: 600;
    text-overflow: ellipsis;
`

const MoreButton = styled.div`
    padding: 6px;
    color: var(--icon-tertiary);
`

export default function Page() {
    const { guildId } = useParams();
    const { isPending, data: guild, isError } = useGuildDetailQuery(guildId ? guildId.toString() : '');
    const [categories, setCategories] = useState<Channel[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!guild) return;

        setCategories(guild.channels.filter(ch => ch.type === ChannelType.Category));
    }, [guild])

    useEffect(() => {
        if (isError) {
            router.push('/channels/me')
        }
    }, [isError])


    return (
        <Fragment>
            <SidebarHeader>
                <HeaderContainer>
                    <HeaderText>{guild?.name}</HeaderText>
                    <MoreButton>
                        <FaAngleDown />
                    </MoreButton>
                </HeaderContainer>
            </SidebarHeader>
            <SidebarContentContainer>
                <div className="py-[16px]">
                    {categories.sort((a, b) => a.createdAt > b.createdAt ? 1 :  a.createdAt === b.createdAt ? 0 : -1).map(cat => {
                        return <div key={cat.id}>
                            <ChannelCategory channel={{...cat, guild: guild}} children={guild ? guild.channels.filter(ch => ch.parent && ch.parent.id === cat.id) : []}></ChannelCategory>
                        </div>
                    })}
                    {guild?.channels.filter(ch => !ch.parent && ch.type !== ChannelType.Category).map(ch => {
                        return <p key={ch.id}>{ch.name}</p>
                    })}
                </div>
            </SidebarContentContainer>
        </Fragment>
    );
}