using Microsoft.Extensions.Logging;

namespace Progressive.Telematics.Labs.Shared
{
    public static class LoggingEvents
    {
        // By convention, EventIds are grouped by their intended LogLevel.
        //
        // The initial value for an EventId is equal to the integer value of the corresponding
        // Microsoft.Extensions.Logging.LogLevel enum multiplied by 1000. 
        //
        // Additional EventIds within a LogLevel are incremented by 1.
        //
        // Example LogLevel=Information EventIds: 2000, 2001, etc.
        // Example LogLevel=Error EventIds: 4000, 4001, 4002, etc.

        // public enum LogLevel
        // {
        //     Trace = 0,
        //     Debug = 1,
        //     Information = 2,
        //     Warning = 3,
        //     Error = 4,
        //     Critical = 5,
        //     None = 6
        // }
        
        public static EventId ObseleteEndpoint = 3002;
        public static EventId HttpRequestRetryException = 3003;

        public static EventId UnexpectedApiResponse = 4000;
        public static EventId SqlException = 4001;
        public static EventId WcfException = 4002;
        public static EventId CustomerSearchOrchestrator_Seach_Error = 4003;
        public static EventId AccountOrchestrator_GetAccounts_Error = 4004;
        public static EventId UpdateCustomerOrchestrator_Update_Error = 4005;
        public static EventId VehiclePicklistOrchestrator_GetVehicleMakes_Error = 4006;
        public static EventId ParticipantOrchestrator_AddParticipant_Error = 4007;
        public static EventId VehiclePicklistOrchestrator_GetOBDScoringAlgorithms_Error = 4008;
        public static EventId VehiclePicklistOrchestrator_GetVehicleModels_Error = 4009;
        public static EventId VehiclePicklistOrchestrator_GetModelYears_Error = 4010;
        public static EventId ParticipantOrchestrator_UpdateNickname_Error = 4011;
        public static EventId ParticipantOrchestrator_EditVehicle_Error = 4012;
        public static EventId DeviceOrchestrator_MarkDefective_Error = 4013;
        public static EventId DeviceOrchestrator_MarkAbandoned_Error = 4014;
        public static EventId DeviceOrchestrator_ReplaceDevice_Error = 4015;
        public static EventId DeviceRecoveryService_UpdateDevice_Error = 4016;
        public static EventId DeviceRecoveryService_DeactivateSim_Error = 4017;
        public static EventId AddNewAccountOrchestrator_AddNewAccountError = 4018;
        public static EventId DeviceOrchestrator_SwapDevice_Error = 4019;
        public static EventId DeviceOrchestrator_ResetDevice_Error = 4020;
        public static EventId DeviceOrchestrator_GetAudioStatusAWS_Error = 4021;
        public static EventId DeviceOrchestrator_SetAudioStatusAWS_Error = 4022;
        public static EventId DeviceOrchestrator_UpdateAudio_Error = 4023;
        public static EventId ParticipantOrchestrator_OptOut_Error = 4024;
        public static EventId ParticipantOrchestrator_DeleteVehicle_Error = 4025;
    }
}

