import { DtlsParameters } from "mediasoup/types";

export interface ConnectTransportDTO {
    transportId: string;
    dtlsParameters: DtlsParameters;
}