import { MAX_VOLUME, MIN_VOLUME } from "@/constants/app-config"
import { create } from "zustand"
import { usePlaySound } from "./audio-store"
import { output } from "framer-motion/client"

interface MediaSettings {
    audioInputDeviceId: string
    audioOutputDeviceId: string
    inputVolume: number
    outputVolume: number
}

interface AppSettings {
    mediaSettings: MediaSettings,
    setAudioOutputDevice: (deviceId: string) => void,
    setAudioInputDevice: (deviceId: string) => void,
    setInputVolume: (volume: number) => void,
    setOutputVolume: (volume: number) => void
}

const defaultMediaSettings: MediaSettings = {
    audioInputDeviceId: "",
    audioOutputDeviceId: "",
    inputVolume: MAX_VOLUME,
    outputVolume: MAX_VOLUME
};

export const useAppSettingsStore = create<AppSettings>((set) => {
    const storedMediaSetting = typeof window !== 'undefined' ? localStorage.getItem("media_settings") : null;
    const initial = storedMediaSetting ? JSON.parse(storedMediaSetting) as MediaSettings : defaultMediaSettings;

    return {
        mediaSettings: initial,
        setAudioOutputDevice: (deviceId: string) => {
            set(state => {
                const newMediaSettings: MediaSettings = { ...state.mediaSettings, audioOutputDeviceId: deviceId };
                if (typeof window !== undefined) localStorage.setItem('media_settings', JSON.stringify(newMediaSettings))
                return { mediaSettings: newMediaSettings }
            });
            usePlaySound('audio-test');
        },
        setAudioInputDevice: (deviceId: string) => {
            set(state => {
                const newMediaSettings: MediaSettings = { ...state.mediaSettings, audioInputDeviceId: deviceId };
                localStorage.setItem('media_settings', JSON.stringify(newMediaSettings))
                return { mediaSettings: newMediaSettings }
            });
        },
        setInputVolume: (volume: number) => {
            set(state => {
                const newVol = volume < MIN_VOLUME ? MIN_VOLUME : volume > MAX_VOLUME ? MAX_VOLUME : volume;
                const newMediaSettings: MediaSettings = { ...state.mediaSettings, inputVolume: newVol };
                localStorage.setItem('media_settings', JSON.stringify(newMediaSettings))
                return { mediaSettings: newMediaSettings }
            });
        },
        setOutputVolume: (volume: number) => {
            set(state => {
                const newVol = volume < MIN_VOLUME ? MIN_VOLUME : volume > MAX_VOLUME ? MAX_VOLUME : volume;
                const newMediaSettings: MediaSettings = { ...state.mediaSettings, outputVolume: newVol };
                localStorage.setItem('media_settings', JSON.stringify(newMediaSettings))
                return { mediaSettings: newMediaSettings }
            });
        }
    };
});


