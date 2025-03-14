import { ReactNode } from "react"
import styles from "./styles.module.css"

interface HomeLayoutProps {
    sidebarContent: ReactNode
}
export default function GuildSidebar({sidebarContent}: HomeLayoutProps) {
    return (
        <div className={styles["container"]}>
                {sidebarContent}
        </div>
    );
}