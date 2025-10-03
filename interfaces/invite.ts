
export interface Invite {
    id: string;
    code: string;
    inviterId: string;
    channelId: string;
    guildId?: string;
    createdAt: string;
    expiresAt: string;
}