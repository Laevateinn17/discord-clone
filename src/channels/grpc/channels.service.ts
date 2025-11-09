import { Observable } from "rxjs";
import { GetDMChannelsDTO } from "../dto/get-dm-channels.dto";


export interface ChannelsService {
    getDmChannels(dto: GetDMChannelsDTO): Observable<any>;
}