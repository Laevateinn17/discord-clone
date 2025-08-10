import { RouterOptions } from "mediasoup/types";

export const ROUTER_CONFIG: RouterOptions = {
    mediaCodecs: [
        {
            kind: 'audio',
            mimeType: "audio/opus",
            clockRate: 48000,
            channels: 2
        }
    ]
};