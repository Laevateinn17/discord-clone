import { UserProfile } from "src/user-profiles/entities/user-profile.entity";

export class UserResponseDTO {
    email: string;
    displayName: string;
    username: string;
    dateOfBirth: Date;
    profile: UserProfile;


    constructor(user: Partial<UserResponseDTO>) {
        Object.assign(this, user);
    }
}