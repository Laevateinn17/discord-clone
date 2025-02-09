import { UserStatus } from "@/enums/user-status.enum";

export interface UserProfile {
    displayName: string;
    pronouns?: string;
    bio?: string;
    status: UserStatus;
    profilePictureURL?: string;
    createdAt: Date;
    updatedAt: Date;
}