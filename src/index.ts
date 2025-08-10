import 'dotenv/config';
import { Server, Socket } from "socket.io";
import * as mediasoup from "mediasoup";
import { Room } from "./interface/room";
import { Worker } from "mediasoup/types";
import { CONNECT_TRANSPORT, CREATE_CONSUMER, CREATE_TRANSPORT, CLOSE_SFU_CLIENT, JOIN_ROOM, CREATE_PRODUCER, RESUME_CONSUMER, PAUSE_CONSUMER, GET_PRODUCERS, PRODUCER_JOINED, ACTIVE_SPEAKER_STATE } from "./const/events";
import { ConnectTransportDTO } from "./dto/connect-transport.dto";
import { CreateProducerDTO } from "./dto/create-producer.dto";
import { CreateConsumerDTO } from "./dto/create-consumer.dto";
import { ROUTER_CONFIG } from "./const/configs";
import { PeerData } from "./interface/peer-data";
import { createServer } from "http";
import { ProducerCreatedDTO } from "./dto/producer-created.dto";
import { ActiveSpeakerState as ActiveSpeakerStateDTO } from "./dto/active-speaker-state.dto";

const server = createServer();

const io = new Server(server, {
    cors: {
        origin: 'https://localhost:3002',
        methods: ["GET", "POST"],
    }
});
const rooms = new Map<string, Room>();
const peers = new Map<string, PeerData>();
let worker: Worker;
(async () => {
    worker = await mediasoup.createWorker()
})();

io.on('connection', (socket: Socket) => {
    let currentRoomId: string;
    socket.on(JOIN_ROOM, async ({ channelId, userId }: { channelId: string, userId: string }, callback) => {
        console.log('join room', channelId);
        currentRoomId = channelId;
        const result = await handleJoinRoom(socket, userId , currentRoomId);
        if (result === null) socket.disconnect();

        callback(result);
    });
    socket.on(CREATE_TRANSPORT, async (callback) => callback(await handleCreateTransport(currentRoomId)));
    socket.on(CONNECT_TRANSPORT, async (payload: ConnectTransportDTO, callback) => callback(await handleConnectTranport(currentRoomId, payload)));
    socket.on(CREATE_PRODUCER, async (payload: CreateProducerDTO, callback) => callback(await handleProduce(currentRoomId, socket, payload)));
    socket.on(CREATE_CONSUMER, async (payload: CreateConsumerDTO, callback) => callback(await handleConsume(currentRoomId, payload)));
    socket.on(RESUME_CONSUMER, async ({ consumerId }: { consumerId: string }, callback) => callback(await handleResumeConsumer(currentRoomId, consumerId)));
    socket.on(PAUSE_CONSUMER, async ({ consumerId }: { consumerId: string }, callback) => callback(await handlePauseConsumer(currentRoomId, consumerId)));
    socket.on(CLOSE_SFU_CLIENT, async () => await handleCloseClient(currentRoomId, socket));
    socket.on(GET_PRODUCERS, async (callback) => callback(await getProducers(currentRoomId)));
    socket.on(ACTIVE_SPEAKER_STATE, async (payload: ActiveSpeakerStateDTO) => await handleUpdateActiveSpeakerState(currentRoomId, socket, payload));
    socket.on('close', async () => await handleCloseClient(currentRoomId, socket));
    socket.on('reconnect', async () => console.log('client reconnects'))
});

async function handleJoinRoom(socket: Socket, userId: string,  roomId: string) {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
        const router = await worker.createRouter(ROUTER_CONFIG);

        rooms.set(roomId, {
            router,
            transports: new Map(),
            consumers: new Map(),
            producers: new Map(),
        });
    }

    peers.set(socket.id, { userId: userId, consumers: new Map(), producers: new Map(), transports: new Map() });

    const room = rooms.get(roomId)!;
    return { rtpCapabilities: room.router.rtpCapabilities };
}

async function handleUpdateActiveSpeakerState(roomId: string, socket: Socket, payload: ActiveSpeakerStateDTO) {
    const peer = peers.get(socket.id);
    if (!peer) return null;

    socket.broadcast.to(roomId).emit(ACTIVE_SPEAKER_STATE, {...payload, userId: peer.userId});
}

async function handleCreateTransport(roomId: string) {
    const room = rooms.get(roomId)!;
    const transport = await room.router.createWebRtcTransport({
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        listenInfos: [
            {
                ip: "0.0.0.0",
                announcedAddress: process.env.HOST,
                portRange: { min: Number(process.env.RTC_MIN_PORT), max: Number(process.env.RTC_MAX_PORT) },
                protocol: "udp",
            }
        ],
    });


    room.transports.set(transport.id, transport);
    console.log('transport is created hahah');
    return ({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
    });
}

async function handleConnectTranport(roomId: string, payload: ConnectTransportDTO) {
    const room = rooms.get(roomId)!;

    console.log('transport is connected');
    const transport = room.transports.get(payload.transportId);
    if (!transport) return null;

    await transport.connect({ dtlsParameters: payload.dtlsParameters });
    return true;
}

async function handleProduce(roomId: string, socket: Socket, payload: CreateProducerDTO) {
    const room = rooms.get(roomId)!;
    const transport = room.transports.get(payload.transportId);
    const peer = peers.get(socket.id);

    if (!transport || !peer) return null;

    const producer = await transport.produce({ kind: payload.kind, rtpParameters: payload.rtpParameters });
    room.producers.set(producer.id, { producer: producer, userId: peer.userId });

    socket.to(roomId).emit(PRODUCER_JOINED, { producerId: producer.id, userId: peer.userId } as ProducerCreatedDTO);

    return { id: producer.id };
}

async function handleConsume(roomId: string, payload: CreateConsumerDTO) {
    const room = rooms.get(roomId)!;
    const transport = room.transports.get(payload.transportId);
    const producer = room.producers.get(payload.producerId);

    if (!transport || !producer) return null;

    if (!room.router.canConsume({ producerId: payload.producerId, rtpCapabilities: payload.rtpCapabilities })) return null;

    const consumer = await transport.consume({ producerId: payload.producerId, rtpCapabilities: payload.rtpCapabilities, paused: true });

    room.consumers.set(consumer.id, consumer);

    return { id: consumer.id, producerId: payload.producerId, kind: consumer.kind, rtpParameters: consumer.rtpParameters };
}

async function handleResumeConsumer(roomId: string, consumerId: string) {
    const room = rooms.get(roomId)!;
    const consumer = room.consumers.get(consumerId);
    if (!consumer) return null;

    await consumer.resume();

    return true;
}

async function handlePauseConsumer(roomId: string, consumerId: string) {
    const room = rooms.get(roomId)!;
    const consumer = room.consumers.get(consumerId);
    if (!consumer) return null;

    await consumer.pause();

    return true;
}

async function handleCloseClient(roomId: string, socket: Socket) {
    console.log('disconnecting client');
    const room = rooms.get(roomId)!;
    const socketId = socket.id;

    const peer = peers.get(socketId)!;
    for (const producer of Array.from(peer.producers.values())) {
        room.producers.delete(producer.id);
        producer.close();
    }

    for (const consumer of Array.from(peer.consumers.values())) {
        room.consumers.delete(consumer.id);
        consumer.close();
    }

    for (const transport of Array.from(peer.transports.values())) {
        transport.close();
        room.transports.delete(transport.id);
    }

    peers.delete(socketId);
    socket.disconnect();
    return true;
}

async function getProducers(roomId: string) {
    const room = rooms.get(roomId)!;
    return { producers: Array.from(room.producers.values()).map(p => ({ userId: p.userId, producerId: p.producer.id })) };
}

server.listen(Number(process.env.PORT), () => {
    console.log('Server listening on port', process.env.PORT);
});

process.on("SIGTERM", () => {
    console.log("Shutting down SFU service...");

    for (const room of Array.from(rooms.values())) {
        for (const transport of Array.from(room.transports.values())) transport.close();
        for (const producer of Array.from(room.producers.values())) producer.producer.close();
        for (const consumer of Array.from(room.consumers.values())) consumer.close();

        room.router.close();
    }

    worker.close();
    process.exit(0);
});