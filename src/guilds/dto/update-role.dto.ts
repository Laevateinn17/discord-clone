import { StartSingleWirelessDeviceImportTaskRequest } from "aws-sdk/clients/iotwireless";

export class UpdateRoleDTO {
    id: string;
    name: string;
    position: number;
    permissions: bigint;
    isHoisted: boolean;
    guildId: string;
    userId: string;
}