"use client"

import styles from "./styles.module.css"
import GuildSidebar from "@/components/guild-sidebar/guild-sidebar";
import { createContext, Dispatch, Fragment, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import UserArea from "@/components/user-area/user-area";
import GuildListSidebar from "@/components/guild-list-sidebar/guild-list-sidebar";
import { useAuth } from "@/contexts/auth.context";
import SettingsPage from "@/components/settings-page/settings-page";
import { isSet } from "util/types";
import { useRelationshipsQuery } from "@/hooks/queries";

interface HomeLayoutProps {
    headerContent: ReactNode
    sidebarContent: ReactNode
    mainContent: ReactNode
    children: ReactNode
}

interface ContentContextType {
    setContent: Dispatch<SetStateAction<ReactNode>>
}

// const ContentContext = createContext<ContentContextType>(null!)

// export function useContentContext() {
//     return useContext(ContentContext);
// }

export default function HomeLayout({ headerContent, sidebarContent, mainContent }: HomeLayoutProps) {
    const { user, getUser, setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    // const [prevTitle, setPrevTitle] = useState(document.title);
    const {data: relationships} = useRelationshipsQuery();
    useEffect(() => {
        if (user) {
            setIsLoading(false);
        }
        else {
            setIsLoading(true);
        }
    }, [user])

    useEffect(() => {
        getUser();
    }, [])


    useEffect(() => {
        // if (isSettingOpen) {
        //     setPrevTitle(document.title);
        //     document.title = "Discord | Settings";
        // }
        // else {
        //     document.title = prevTitle;
        // }
    }, [isSettingOpen])

    return (
        <div className={styles["page"]}>
            {isLoading ?
                // <p>Loading...</p>
                // <p>Loading mate</p>
                <div></div>
                :
                <Fragment>
                    <div className={`${styles["main-content"]} ${isSettingOpen ? styles["main-content-hidden"] : ""}`}>
                        <GuildListSidebar />
                        <GuildContent sidebarContent={sidebarContent} content={mainContent} setIsSettingOpen={setIsSettingOpen} />
                    </div>
                    <SettingsPage show={isSettingOpen} closeSettingsHandler={() => setIsSettingOpen(false)} />
                </Fragment>
            }
        </div>
    );
}


function GuildContent({ sidebarContent, content, setIsSettingOpen }: { sidebarContent: ReactNode, content: ReactNode, setIsSettingOpen: Dispatch<SetStateAction<boolean>> }) {
    // const [content, setContent] = useState<ReactNode>(<div></div>);
    const { user } = useAuth();
    return (
        <Fragment>
            {/* <ContentContext.Provider value={{ setContent }}> */}
                <div className={`${styles["guild-sidebar-container"]}`}>
                    <GuildSidebar sidebarContent={sidebarContent} />
                    <UserArea user={user!} openSettingsHandler={() => setIsSettingOpen(true)} />
                </div>
            {/* </ContentContext.Provider> */}
            <div className={styles["content-container"]}>
                {content}
            </div>
        </Fragment>
    )
}