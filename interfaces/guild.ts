import { Channel } from "./channel";
import { UserProfile } from "./user-profile";

export interface Guild {
    id: string;
    name: string;
    ownerId: string;
    iconURL?: string;
    channels: Channel[]
    createdAt: Date
    updatedAt: Date
    members: UserProfile[];
}