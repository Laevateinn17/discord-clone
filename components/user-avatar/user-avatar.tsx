import { UserData } from "@/interfaces/UserData";
import styles from "./styles.module.css"
import { getImageURL } from "@/services/storage/storage.service";
import { FaCircle } from "react-icons/fa";
import { UserStatus } from "@/enums/user-status.enum";
import { MdCircle, MdDoNotDisturbOn, MdOutlineCircle } from "react-icons/md";
import { PiMoonFill } from "react-icons/pi";
import { Fragment } from "react";
import { UserProfile } from "@/interfaces/user-profile";

export default function UserAvatar({ user, showProfile }: { user: UserProfile, showProfile?: boolean }) {
    
    return (
        <div className={styles["pfp-wrapper"]}>
            <div className={styles["pfp-container"]}>
                <img className={styles["test"]} src={user.avatarURL ? getImageURL('avatars', user.avatarURL) : getImageURL('assets', user.defaultAvatarURL)} />
            </div>
            <FaCircle className={styles["mask"]} fill="transparent" size={16} />
            <div className={styles["status-container"]}>
                {user.status === UserStatus.Online && <MdCircle className={""} fill="#44a25b" size={12} />}
                {(user.status === UserStatus.Invisible || user.status == UserStatus.Offline) && <MdOutlineCircle className={styles["offline-icon"]} fill="#80848e" size={12} />}
                {user.status === UserStatus.DoNotDisturb && <MdDoNotDisturbOn fill="#f23f43" size={13} />}
                {user.status === UserStatus.Idle && <PiMoonFill fill="#f0b232" className={styles["idle-icon"]} size={12} />}
            </div>
        </div>
    );
}