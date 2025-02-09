import { ReactNode } from "react"
import styles from "./styles.module.css"

interface HomeLayoutProps {
    headerContent: ReactNode
    sidebarContent: ReactNode
}
export default function GuildSidebar({headerContent, sidebarContent}: HomeLayoutProps) {
    return (
        <div className={styles["container"]}>
            <div className={`${styles["header-container"]} shadow-md`}>
                {headerContent}
            </div>
            <div className={styles["content-container"]}>
                {sidebarContent}
            </div>
        </div>
    )
}