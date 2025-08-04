import { useAppSettingsStore } from "@/app/stores/app-settings-store";
import { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";
import { SettingsSectionHeader } from "./settings-page";
import { MAX_VOLUME, MIN_VOLUME } from "@/constants/app-config";
import Tooltip from "../tooltip/tooltip";

interface TabItem {
    id: string;
    header: string;
    content?: ReactNode;
}

const TabBar = styled.div`
    display: flex;
    gap: 16px;
    border-bottom: 1px solid var(--border-subtle);
`

const Tab = styled.span`
    color: var(--interactive-normal);
    font-weight: 600;
    padding-bottom: 16px;
    cursor: pointer;
    &.active {
        color: var(--text-brand);
        border-bottom: 1px solid var(--text-brand);
    }

    &:hover {
        color: var(--interactive-hover);
        border-bottom: 1px solid var(--text-brand);
    }
`


export function MediaSettingsSection() {
    const tabItems: TabItem[] = [
        {
            id: 'voice',
            header: 'Voice',
            content: <VoiceSettingsTab />
        },
        {
            id: 'video',
            header: 'Video',
            content: undefined
        }
    ];

    const [selectedTab, setSelectedTab] = useState<TabItem>(tabItems[0]);
    return (
        <div className="flex gap-[32px] flex-col w-full">
            <SettingsSectionHeader>Voice & Video</SettingsSectionHeader>
            <div className="">
                <TabBar>
                    {tabItems.map(ti => {
                        return (
                            <Tab key={ti.id} className={`${selectedTab.header === ti.header ? 'active' : ''}`}>
                                {ti.header}
                            </Tab>
                        );
                    })}
                </TabBar>
                <div className="mt-[24px]">
                    {selectedTab.content}
                </div>
            </div>
        </div>
    );
}

const SubHeader = styled.p`
    margin-bottom: 8px;
    font-weight: 500;
`

const InputSelect = styled.select`
    background-color: var(--input-background);
    border: 1px solid var(--input-border);
    border-radius: 8px;
    padding: 0 10px;
    min-height: 40px;

    &:focus {
        outline: none;
    }
`

const InputSlider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  height: 3px;
  cursor: pointer;


  &::-webkit-slider-thumb {
    cursor: ew-resize;
  }

  &::-moz-range-thumb {
    cursor: ew-resize;
  }

  &::-ms-thumb {
    cursor: ew-resize;
  }
`;


const SliderBubble = styled.p`
    position: absolute;
    bottom: 100%;
    pointer-events: none;
    background: black;
    padding: 8px;
    border-radius: 6px;
    transform: translateX(-50%);
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 500;
`

function Slider({ min, max, value, onChange }: { min: number, max: number, value: number, onChange: (value: number) => void }) {
    const [showValue, setShowValue] = useState(false);


    return (
        <div className="relative">
            <InputSlider min={min} max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                onMouseEnter={() => setShowValue(true)}
                onMouseLeave={() => setShowValue(false)}
            />
            {showValue && <SliderBubble style={{ left: `${value / max * 100}%` }}>{value}%</SliderBubble>}
        </div>
    )
}

function VoiceSettingsTab() {
    const { mediaSettings, setAudioInputDevice, setAudioOutputDevice, setInputVolume, setOutputVolume } = useAppSettingsStore();
    const [devices, setDevices] = useState<MediaDeviceInfo[] | null>(null);

    useEffect(() => {

        const handleDeviceChange = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            setDevices(devices);
        }
        navigator.mediaDevices.enumerateDevices().then(dev => { setDevices(dev); console.log(dev) });

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
        }
    }, [])

    const inputDevices = devices?.filter(d => d.kind === "audioinput") || [];
    const outputDevices = devices?.filter(d => d.kind === "audiooutput") || [];


    return (
        <div className="flex flex-col gap-[16px]">
            <div className="flex gap-[16px] flex-col">
                <div className="flex gap-[16px]">
                    <div className="flex-1">
                        <SubHeader>Input Device</SubHeader>
                        <InputSelect
                            className="w-full p-2 border rounded"
                            value={mediaSettings.audioInputDeviceId}
                            onChange={(e) => setAudioInputDevice(e.target.value)}
                        >
                            {inputDevices.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || "Unnamed Input"}
                                </option>
                            ))}
                        </InputSelect>
                    </div>
                    <div className="flex-1">
                        <SubHeader>Output Device</SubHeader>
                        <InputSelect
                            className="w-full p-2 border rounded"
                            value={mediaSettings.audioOutputDeviceId}
                            onChange={(e) => setAudioOutputDevice(e.target.value)}
                        >
                            {outputDevices.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || "Unnamed Input"}
                                </option>
                            ))}
                        </InputSelect>
                    </div>
                </div>
                <div className="flex gap-[16px]">
                    <div className="flex-1">
                        <SubHeader>Input Volume</SubHeader>
                        <div className="relative">
                            <Slider min={MIN_VOLUME} max={MAX_VOLUME} value={mediaSettings.inputVolume} onChange={(value) => setInputVolume(Number(value))} />
                        </div>
                        {/* <output htmlFor="input-volume" ="value = foo.valueAsNumber;"></output> */}
                    </div>
                    <div className="flex-1">
                        <SubHeader>Output Volume</SubHeader>
                        <Slider min={MIN_VOLUME} max={MAX_VOLUME} value={mediaSettings.outputVolume} onChange={(value) => setOutputVolume(Number(value))} />
                    </div>

                </div>
            </div>
        </div>
    );
}