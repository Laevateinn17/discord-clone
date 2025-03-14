"use client"
import SidebarHeader from "@/components/guild-sidebar/sidebar-header";
import { useGuildDetailQuery } from "@/hooks/queries";
import { useParams } from "next/navigation";
import { FaAngleDown } from "react-icons/fa6";
import styled from "styled-components";

export default function Header() {
    const { guildId } = useParams();
    const { isPending, data: guild } = useGuildDetailQuery(guildId ? guildId.toString() : '');

    return (
        <div></div>
    )
}