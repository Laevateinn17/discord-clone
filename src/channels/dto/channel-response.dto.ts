import { UserProfileResponseDTO } from "src/user-profiles/dto/user-profile-response.dto";

export class ChannelResponseDTO {
    id: string;
    name?: string;
    isPrivate: boolean
    createdAt: Date;
    updatedAt: Date;
    parent?: ChannelResponseDTO;
    recipients: UserProfileResponseDTO[]
}