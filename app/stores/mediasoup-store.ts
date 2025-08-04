import { create } from "zustand";
import { Device } from "mediasoup-client";
import { Consumer, Producer, Transport } from "mediasoup-client/types";

interface MediasoupStoreState {
  device?: Device;
  channelId?: string;
  sendTransport?: Transport;
  recvTransport?: Transport;
  producers: Map<string, Producer>;
  consumers: Map<string, Consumer>;

  setDevice: (device: Device, channelId: string) => void;
  setSendTransport: (transport: Transport) => void;
  setRecvTransport: (transport: Transport) => void;
  addProducer: (id: string, producer: Producer) => void;
  removeProducer: (id: string) => void;
  addConsumer: (id: string, consumer: Consumer) => void;
  removeConsumer: (id: string) => void;
  cleanup: () => void;
}

export const useMediasoupStore = create<MediasoupStoreState>((set, get) => ({
  device: undefined,
  channelId: undefined,
  sendTransport: undefined,
  recvTransport: undefined,
  producers: new Map(),
  consumers: new Map(),

  setDevice: (device, channelId) => set({ device, channelId }),
  setSendTransport: (transport) => set({ sendTransport: transport }),
  setRecvTransport: (transport) => set({ recvTransport: transport }),
  addProducer: (id, producer) => {
    const map = new Map(get().producers);
    map.set(id, producer);
    set({ producers: map });
  },
  removeProducer: (id) => {
    const map = new Map(get().producers);
    const producer = map.get(id);
    if (producer) {
      producer.close();
      map.delete(id);
    }
    set({ producers: map });
  },

  addConsumer: (id, consumer) => {
    const map = new Map(get().consumers);
    map.set(id, consumer);
    set({ consumers: map });
  },
  removeConsumer: (id) => {
    const map = new Map(get().consumers);
    const consumer = map.get(id);
    if (consumer) {
      consumer.close();
      map.delete(id);
    }
    set({ consumers: map });
  },

  cleanup: () => {
    get().producers.forEach((p) => p.close());
    get().consumers.forEach((c) => c.close());
    get().sendTransport?.close();
    get().recvTransport?.close();
    set({
      device: undefined,
      sendTransport: undefined,
      recvTransport: undefined,
      producers: new Map(),
      consumers: new Map(),
    });
  },
}));
