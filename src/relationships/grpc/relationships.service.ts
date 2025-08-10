import { Observable } from "rxjs";

export interface RelationshipsService {
    getRelationships({ userId }: { userId: string }): Observable<any>
}