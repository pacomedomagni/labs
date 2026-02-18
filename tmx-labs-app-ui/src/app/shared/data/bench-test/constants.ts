import { BenchTestBoardStatus, BenchTestDeviceStatus } from "./enums";

export const BenchTestBoardStatusDescription = new Map<BenchTestBoardStatus, string>([
    [BenchTestBoardStatus.Open, "Open"],
    [BenchTestBoardStatus.Loading, "Loading"],
    [BenchTestBoardStatus.Running, "Running"],
    [BenchTestBoardStatus.Complete, "Complete"],
    [BenchTestBoardStatus.Unknown, "Unknown"]
]);

export const BenchTestDeviceStatusDescription = new Map<BenchTestDeviceStatus, string>([
    [BenchTestDeviceStatus.Started, "Started"],
    [BenchTestDeviceStatus.Waiting, "Waiting"],
    [BenchTestDeviceStatus.MainUpdating, "Main Updating"],
    [BenchTestDeviceStatus.OBD2Updating, "OBD2 Updating"],
    [BenchTestDeviceStatus.CellUpdating, "Cell Updating"],
    [BenchTestDeviceStatus.GPSUpdating, "GPS Updating"],
    [BenchTestDeviceStatus.ConfigUpdating, "Config Updating"],
    [BenchTestDeviceStatus.Completed, "Completed"],
    [BenchTestDeviceStatus.Error, "Error"],
    [BenchTestDeviceStatus.Running, "Running"],
    [BenchTestDeviceStatus.AudioUpdating, "Audio Updating"],
    [BenchTestDeviceStatus.FirmwareError, "Firmware Error"],
]);

