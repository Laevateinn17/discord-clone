import { GuildUpdateType } from "../enums/guild-update-type.enum";

export interface GuildUpdateDTO {
    type: GuildUpdateType;
    data: any;
}