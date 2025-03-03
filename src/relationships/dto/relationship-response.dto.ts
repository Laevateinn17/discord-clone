import { AutoMap } from "@automapper/classes"
import { Column, CreateDateColumn } from "typeorm"
import { RelationshipType } from "../enums/relationship-type.enum"

export class RelationshipResponseDTO {
    @AutoMap()
    id: string

    @AutoMap()
    userId: string

    @AutoMap()
    @Column({
        type: 'enum',
        enum: RelationshipType,
        default: RelationshipType.None
    })
    type: RelationshipType

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

    @AutoMap()
    @CreateDateColumn({ name: 'updated_at' })
    updatedAt: Date
}