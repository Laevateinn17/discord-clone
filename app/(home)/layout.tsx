"use client"

import styles from "./styles.module.css"
import GuildSidebar from "@/components/guild-sidebar/guild-sidebar";
import { ReactNode, useEffect } from "react";
import UserArea from "@/components/user-area/user-area";
import GuildListSidebar from "@/components/guild-list-sidebar/guild-list-sidebar";
import { getCurrentUserData } from "@/services/users/users.service";
import { useAuth } from "@/contexts/auth.context";

interface HomeLayoutProps {
    headerContent: ReactNode
    sidebarContent: ReactNode
    children: ReactNode
}

export default function HomeLayout({headerContent, sidebarContent, children}: HomeLayoutProps) {
    const {user} = useAuth();

    useEffect(() => {
        console.log(user)
    }, [user])
    return (
        <div className={styles["page"]}>
            <GuildListSidebar/>
            <div className={styles["guild-sidebar-container"]}>
                <GuildSidebar headerContent={headerContent} sidebarContent={sidebarContent}/>
                <UserArea/>
            </div>
            //user info
            //maincontent
        </div>
    );
}
