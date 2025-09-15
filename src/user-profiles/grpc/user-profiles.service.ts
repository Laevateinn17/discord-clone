import { Observable } from "rxjs";


export interface UserProfilesService {
    getUserProfiles({userIds}: {userIds: string[]}): Observable<any>
}