import { UserData } from "@/interfaces/UserData";
import styles from "./styles.module.css"
import { getImageURL } from "@/services/storage/storage.service";
import { FaCircle } from "react-icons/fa";
import { UserStatus } from "@/enums/user-status.enum";
import { MdCircle, MdDoNotDisturbOn, MdOutlineCircle } from "react-icons/md";
import { PiMoonFill } from "react-icons/pi";
import { Fragment } from "react";
import { UserProfile } from "@/interfaces/user-profile";

export default function UserAvatar({ user, showStatus = true, size }: { user: UserProfile, showStatus?: boolean, size?: string }) {
    const iconSize = size ? parseInt(size) / 2.6 : 12;
    return (
        <div className={styles["pfp-wrapper"]}>
            <div
                className={`${styles["pfp-container"]}`}
                style={{ height: size ? `${size}px` : "32px", width: size ? `${size}px` : "32px" }}>
                <img className="" src={user.avatarURL ? getImageURL('avatars', user.avatarURL) : getImageURL('assets', user.defaultAvatarURL)} />
            </div>
            {showStatus &&
                <Fragment>
                    <FaCircle className={styles["mask"]} fill="transparent" size={size ? parseInt(size) / 2 : 16} />
                    <div className={styles["status-container"]}>
                        {user.isOnline ? (
                            <>
                                {user.status === UserStatus.Online && (
                                    <MdCircle className={""} fill="#44a25b" size={iconSize} />
                                )}
                                {user.status === UserStatus.DoNotDisturb && (
                                    <MdDoNotDisturbOn fill="#f23f43" size={iconSize} />
                                )}
                                {user.status === UserStatus.Idle && (
                                    <PiMoonFill fill="#f0b232" className={styles["idle-icon"]} size={iconSize} />
                                )}
                                {user.status === UserStatus.Invisible && (
                                    <MdOutlineCircle className={styles["offline-icon"]} fill="#80848e" size={iconSize} />
                                )}
                            </>
                        ) : (
                            <MdOutlineCircle className={styles["offline-icon"]} fill="#80848e" size={iconSize} />
                        )}

                    </div>
                </Fragment>
            }
        </div>
    );
}