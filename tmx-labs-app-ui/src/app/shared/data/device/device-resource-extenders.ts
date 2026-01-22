export const DeviceResourceExtenders = {
    AudioStatus: 'IsAudioOn',
} as const;

export type DeviceResourceExtenderKey = keyof typeof DeviceResourceExtenders;
