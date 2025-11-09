import { AutoMap } from "@automapper/classes";
import { ChannelResponseDTO } from "src/channels/dto/channel-response.dto";
import { UserProfileResponseDTO } from "src/user-profiles/dto/user-profile-response.dto";
import { GuildMemberResponseDTO } from "./guild-member-response.dto";
import { RoleResponseDTO } from "./role-response.dto";

export class GuildResponseDTO {
    @AutoMap()
    id: string;

    @AutoMap()
    name: string;

    @AutoMap()
    ownerId: string;

    @AutoMap()
    iconURL?: string;

    @AutoMap()
    channels: ChannelResponseDTO[]

    @AutoMap()
    createdAt: Date

    @AutoMap()
    updatedAt: Date

    members: GuildMemberResponseDTO[];

    @AutoMap()
    roles: RoleResponseDTO[];
}