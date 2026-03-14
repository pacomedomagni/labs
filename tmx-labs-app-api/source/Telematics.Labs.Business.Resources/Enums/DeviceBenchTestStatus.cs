namespace Progressive.Telematics.Labs.Business.Resources.Enums;

public enum DeviceBenchTestStatus
{
    Started = 1,
    Waiting = 2,
    MainUpdating = 3,
    OBD2Updating = 4,
    CellUpdating = 5,
    GPSUpdating = 6,
    ConfigUpdating = 7,
    Completed = 8,
    Error = 9,
    Running = 10,
    AudioUpdating = 11,
    FirmwareError = 12
}
