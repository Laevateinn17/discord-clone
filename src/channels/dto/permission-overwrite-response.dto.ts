import { AutoMap } from "@automapper/classes";
import { PermissionOverwriteTargetType } from "../enums/permission-overwrite-target-type.enum";

export class PermissionOverwriteResponseDTO {
    @AutoMap()
    id: string;

    @AutoMap()
    allow: bigint;

    @AutoMap()
    deny: bigint;

    @AutoMap()
    targetId: string

    @AutoMap()
    targetType: PermissionOverwriteTargetType

    @AutoMap()
    channelId: string

}