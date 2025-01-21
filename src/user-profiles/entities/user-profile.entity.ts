import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { UserStatus } from "../enums/user-status.enum";

@Entity()
export class UserProfile {
    @PrimaryColumn()
    id: number
    @Column({name: 'display_name'})
    displayName: string;

    @Column()
    pronouns?: string;

    @Column()
    bio?: string;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.Offline
    })
    status: UserStatus;

    @Column()
    profilePictureURL?: string;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date;

    @OneToOne(() => User)
    user: User;

    constructor(profile: Partial<UserProfile>) {
        Object.assign(this, profile);
    }
}
