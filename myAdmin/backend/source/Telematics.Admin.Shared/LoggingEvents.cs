using Microsoft.Extensions.Logging;

namespace Progressive.Telematics.Admin.Shared
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
        public static EventId RolloutStatusResult = 2000;
        public static EventId NotFoundInHomebaseParticipantManagementOrDeviceApi = 2001;

        public static EventId UnlockRegistrationHelper_NoDecisionMatch = 3000;

        public static EventId ObseleteEndpoint = 3002;
        public static EventId HttpRequestRetryException = 3003;

        public static EventId UnexpectedApiResponse = 4000;
        public static EventId SqlException = 4001;
        public static EventId WcfException = 4002;
        public static EventId UpdateRegistrationCodeHelper_NoDecisionMatch = 4003;
        public static EventId ResetRegistrationHelper_NoDecisionMatch = 4004;

        public static EventId PolicyDeviceApi_UpdateMobileRegistration = 4100;
        public static EventId PolicyDal_ReEnrollInMobile = 4101;

        public static EventId PolicyOrchestrator_CompatibilityItems = 3001;
        public static EventId PolicyOrchestrator_UnknownError = 4200;
        public static EventId PolicyOrchestrator_GetPolicy_NoRegistration = 4201;
        public static EventId PolicyOrchestrator_GetPolicy_ProcessingError = 4202;
        public static EventId PolicyOrchestrator_UpdateMailingAddress_Failure = 4203;
        public static EventId PolicyOrchestrator_UpdateAppAssignment_Failure = 4204;

        public static EventId RegistrationOrchestrator_GetRegistrationsByPolicy_LegacyError = 3004;
        public static EventId RegistrationOrchestrator_GetRegistrations_RegistrationNull = 4300;
        public static EventId RegistrationOrchestrator_GetRegistrations_UnknownError = 4301;
        public static EventId RegistrationOrchestrator_GetRegistrationsByPolicy_RegistrationsNull = 4302;
        public static EventId RegistrationOrchestrator_GetRegistrationsByPolicy_UnknownError = 4303;
        public static EventId RegistrationOrchestrator_GetConflictingRegistrations_UnknownError = 4304;
        public static EventId RegistrationOrchestrator_DetermineRegistrationStatusAfterUnlock_UnknownError = 4305;
        public static EventId RegistrationOrchestrator_UnlockRegistration_Failed = 4306;
        public static EventId RegistrationOrchestrator_UnlockRegistration_Unknown = 4307;
        public static EventId RegistrationOrchestrator_UpdateRegistrationCode_UpdateConflict = 4308;
        public static EventId RegistrationOrchestrator_UpdateRegistrationCode_UpdateRegistration = 4309;
        public static EventId RegistrationOrchestrator_UpdateRegistrationCode_Unknown = 4310;
        public static EventId RegistrationOrchestrator_UpdateRegistrationStatusCode_UpdateRegistrationStatus = 4311;
        public static EventId RegistrationOrchestrator_UpdateRegistrationStatusCode_Unknown = 4312;
        public static EventId RegistrationOrchestrator_ResetRegistration_Failed = 4313;
        public static EventId RegistrationOrchestrator_ResetRegistration_Unknown = 4314;
        public static EventId RegistrationOrchestrator_Unenroll_Failed = 4315;
        public static EventId RegistrationOrchestrator_Unenroll_Unknown = 4316;
        public static EventId RegistrationOrchestrator_UpdateRegistrationCode_FallbackToLegacy = 4317;
        public static EventId RegistrationOrchestrator_UpdateRegistrationCode_ClaimsRegistrationFailure = 4318;
        public static EventId RegistrationOrchestrator_GetRegistrations_FallbackToLegacy = 4319;
        public static EventId RegistrationOrchestrator_UnlockRegistration_FallbackToLegacy = 4320;
        public static EventId RegistrationOrchestrator_UnlockRegistration_InvalidSeqId = 4321;
        public static EventId RegistrationOrchestrator_UpdateRegistrationCode_TelematicsIdNullOrEmpty = 4322;
        public static EventId RegistrationOrchestrator_DeviceApiFoundData_HomebaseParticipantManagementDidNot = 4323;
        public static EventId RegistrationOrchestrator_DeviceApi_Found_Other_TelematicsIds = 4324;
        public static EventId RegistrationOrchestrator_NoMatchingSnapshotParticipant_InMobileRegistrationsCollection = 4325;
        public static EventId RegistrationOrchestrator_GetRegistrationsByPolicy_LegacyCountMismatch = 4326;
        public static EventId RegistrationOrchestrator_GetRegistrationsByPolicy_LegacyFieldMismatch = 4327;
        public static EventId RegistrationOrchestrator_GetRegistrationsByPolicy_ModernFunctionalityError = 4328;

        public static EventId SupportDal_StoredProcedureFailed = 4401;

        public static EventId AccidentDetectionOrchestrator_Unenroll_Failed = 4500;
        public static EventId AccidentDetectionOrchestrator_Unenroll_Unknown = 4501;
    }
}
