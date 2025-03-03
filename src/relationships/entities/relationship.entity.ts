import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RelationshipType } from "../enums/relationship-type.enum";
import { AutoMap } from "@automapper/classes";

@Entity()
export class Relationship {
    @AutoMap()
    @PrimaryGeneratedColumn('uuid')
    id: string

    @AutoMap()
    @Column({name: 'user1_id'})
    user1Id: string

    @AutoMap()
    @Column({name: 'user2_id'})
    user2Id: string

    @AutoMap()
    @Column({
        type: 'enum',
        enum: RelationshipType,
        default: RelationshipType.None
    })
    type: RelationshipType

    @AutoMap()
    @CreateDateColumn({name: 'created_at'})
    createdAt: Date

    @AutoMap()
    @CreateDateColumn({name: 'updated_at'})
    updatedAt: Date
}
