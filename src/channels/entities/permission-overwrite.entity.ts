import { AutoMap } from "@automapper/classes";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { PermissionOverwriteTargetType } from "../enums/permission-overwrite-target-type.enum";
import { Channel } from "./channel.entity";

@Unique(['channelId', 'targetId'])
@Entity()
export class PermissionOverwrite {
    @AutoMap()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @AutoMap()
    @Column({type: 'bigint', default: 0})
    allow: bigint;

    @AutoMap()
    @Column({type: 'bigint', default: 0})
    deny: bigint;

    @AutoMap()
    @Column({name: 'target_id'})
    targetId: string

    @AutoMap()
    @Column({name: 'target_type', type: 'enum', enum: PermissionOverwriteTargetType})
    targetType: PermissionOverwriteTargetType

    @AutoMap()
    @Column({name: 'channel_id'})
    channelId: string

    @AutoMap()
    @ManyToOne(() => Channel, (channel) => channel.permissionOverwrites, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn({name: 'channel_id'})
    channel: Channel;

}