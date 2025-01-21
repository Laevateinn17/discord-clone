import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AccountStatus } from "../enums/account-status.enum";
import { UserProfile } from "src/user-profiles/entities/user-profile.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    username: string;
    
    @Column()
    dateOfBirth: Date;

    @Column({
        type: 'enum',
        enum: AccountStatus,
        default: AccountStatus.Active
    })
    status: AccountStatus;

    @OneToOne(() => UserProfile, {cascade: true})
    profile: UserProfile;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date;

    constructor(user: Partial<User>) {
        Object.assign(this, user);
    }
}

