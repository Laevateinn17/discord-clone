import { useAppSettingsStore } from "@/app/stores/app-settings-store";
import { usePlaySound } from "@/app/stores/audio-store";
import { useMediasoupStore } from "@/app/stores/mediasoup-store";
import { useGetChannelVoiceStates } from "@/app/stores/voice-state-store";
import { CONNECT_TRANSPORT, CREATE_CONSUMER, CREATE_PRODUCER, CREATE_RTC_ANSWER, CREATE_RTC_OFFER, CREATE_SEND_TRANSPORT, CREATE_RECV_TRANSPORT, GET_RTP_CAPABILITIES, ICE_CANDIDATE, PRODUCER_CREATED, VOICE_UPDATE_EVENT, CONSUMER_CREATED } from "@/constants/events";
import { useSocket } from "@/contexts/socket.context";
import { VoiceEventType } from "@/enums/voice-event-type";
import { useCurrentUserQuery } from "@/hooks/queries";
import { ConsumerCreatedDTO } from "@/interfaces/dto/consumer-created.dto";
import { CreateConsumerDTO } from "@/interfaces/dto/create-consumer.dto";
import { ProducerCreatedDTO } from "@/interfaces/dto/producer-created.dto";
import { VoiceEventDTO } from "@/interfaces/dto/voice-event.dto";
import { Device } from "mediasoup-client";
import { ConsumerOptions, RtpCapabilities, Transport } from "mediasoup-client/types";
import { useEffect, useRef } from "react";

export function PeerConnectionManager() {
    const { data: user } = useCurrentUserQuery();
    const { socket } = useSocket();
    const audioRefs = useRef<HTMLAudioElement>({} as any);
    const { mediaSettings } = useAppSettingsStore();
    const { setDevice, setSendTransport, setRecvTransport } = useMediasoupStore()

    useEffect(() => {
        audioRefs.current.volume = mediaSettings.outputVolume / 100;
    }, [mediaSettings.outputVolume])

    useEffect(() => {
        // let pc = usePeerConnectionStore.getState().peerConnection;
        // if (!pc) return;

        // navigator.mediaDevices.getUserMedia({
        //     audio: { deviceId: { exact: mediaSettings.audioInputDeviceId } }
        // }).then(stream => {
        //     const newAudioTrack = stream.getAudioTracks()[0];
        //     const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
        //     if (sender) {
        //         sender.replaceTrack(newAudioTrack);
        //     }
        // });


    }, [mediaSettings.audioInputDeviceId])


    const handleVoiceStateUpdate = async (event: VoiceEventDTO) => {
        const voiceStates = useGetChannelVoiceStates(event.channelId);
        if (event.type == VoiceEventType.VOICE_LEAVE) {
            if (event.userId === user?.id) {
                // removeConnection();
            }
            usePlaySound('voice-leave');
        }
        else if (event.type === VoiceEventType.VOICE_JOIN) {
            console.log(`${event.userId} joined, from ${user?.id}`);
            if (event.userId === user?.id) {
                socket.emit(GET_RTP_CAPABILITIES, { channelId: event.channelId });
            }
        }
    }

    const onRTPCapabilities = async (payload: { channelId: string, rtpCapabilities: RtpCapabilities }) => {
        const device = new Device();
        await device.load({ routerRtpCapabilities: payload.rtpCapabilities });
        setDevice(device, payload.channelId);

        socket.emit(CREATE_SEND_TRANSPORT);
        socket.emit(CREATE_RECV_TRANSPORT);
    }

    const onCreateSendTransport = async (payload: any) => {
        const { device, addProducer, channelId } = useMediasoupStore.getState();
        if (!device) return;
        const transport = device.createSendTransport(payload);
        transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            console.log('send transport connected');
            try {
                socket.emit(CONNECT_TRANSPORT, {
                    transportId: transport.id,
                    dtlsParameters
                });
                callback();
            } catch (err) {
                console.log(err)
            }
        });

        transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
            try {
                socket.emit(CREATE_PRODUCER, {
                    transportId: transport.id,
                    channelId: channelId,
                    kind,
                    rtpParameters,
                }, (producerId: string) => {
                    callback({ id: producerId });
                });
            } catch (err) {
                console.log(err);
            }
        });
        setSendTransport(transport);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const track = stream.getAudioTracks()[0];
        const producer = await transport.produce({ track: track });

        addProducer(producer.id, producer);
    }

    const onCreateRecvTransport = (payload: any) => {
        const { device } = useMediasoupStore.getState();
        if (!device) return;
        const transport = device.createRecvTransport(payload);
        transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            console.log('recv transport connected');
            try {
                socket.emit(CONNECT_TRANSPORT, {
                    transportId: transport.id,
                    dtlsParameters
                });
                callback();
            } catch (err) {
                console.log(err)
            }
        });
        setRecvTransport(transport);
    }


    const onProducerCreated = async (payload: ProducerCreatedDTO) => {
        const { device, recvTransport } = useMediasoupStore.getState();
        if (!device || !recvTransport) return;

        socket.emit(CREATE_CONSUMER, { transportId: recvTransport.id, producerId: payload.producerId, kind: payload.kind, rtpCapabilities: device.rtpCapabilities } as CreateConsumerDTO);
    }

    const onConsumerCreated = async (payload: ConsumerCreatedDTO) => {
        const { recvTransport, addConsumer } = useMediasoupStore.getState();
        if (!recvTransport) return;

        const consumer = await recvTransport.consume({ id: payload.id, producerId: payload.producerId, kind: payload.kind, rtpParameters: payload.rtpParameters });
        consumer.resume();
        addConsumer(consumer.id, consumer);
    }

    useEffect(() => {
        if (!socket) return;
        socket.on(VOICE_UPDATE_EVENT, handleVoiceStateUpdate);
        socket.on(GET_RTP_CAPABILITIES, onRTPCapabilities);
        socket.on(CREATE_SEND_TRANSPORT, onCreateSendTransport);
        socket.on(CREATE_RECV_TRANSPORT, onCreateRecvTransport);
        socket.on(PRODUCER_CREATED, onProducerCreated);
        socket.on(CONSUMER_CREATED, onConsumerCreated);

        return () => {
            socket.removeListener(VOICE_UPDATE_EVENT, handleVoiceStateUpdate);
            socket.removeListener(GET_RTP_CAPABILITIES, onRTPCapabilities);
            socket.removeListener(CREATE_SEND_TRANSPORT, onCreateSendTransport);
            socket.removeListener(CREATE_RECV_TRANSPORT, onCreateRecvTransport);
            socket.removeListener(PRODUCER_CREATED, onProducerCreated);
            socket.removeListener(CONSUMER_CREATED, onConsumerCreated);
        }
    }, [socket])

    return (
        <audio ref={audioRefs} autoPlay playsInline />
    );
}