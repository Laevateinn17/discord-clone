import { Observable } from "rxjs";

export interface GuildsService {
    findAll({userId}: {userId: string}): Observable<any>
}