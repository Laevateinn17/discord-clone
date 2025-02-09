import { UserProfile } from "./user-profile";

export interface UserResponse {
    id: string

    email: string;
    
    username: string;
    
    dateOfBirth: Date;

    profile: UserProfile
}