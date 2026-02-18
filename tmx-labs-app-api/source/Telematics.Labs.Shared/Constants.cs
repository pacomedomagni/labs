
using System.Runtime.InteropServices;
using Progressive.WAM.Token.Inspector.Extensions;

namespace Progressive.Telematics.Labs.Shared
{
    public static class Constants
    {
        public const int GPSDeviceVersion = 15;
        public const int W7DeviceVersion = 16;
        public const int SecondsInDay = 86400;
        public static class General
        {
            public const string Unknown = "Unknown";

            public const string LdapDefault = "**Unknown";
            public const string StateDefault = "XX";
            public const string ZipDefault = "00000";
        }

        public static class LdapUserDefaults
        {
            public const string Password = "Help@1234567";
            public const string PasswordQuestion = "question";
            public const string PasswordAnswer = "answer";
            public const string Address = General.Unknown;
            public const string City = General.Unknown;
            public const string Company = General.Unknown;
            public const string FirstName = General.Unknown;
            public const string FullName = General.Unknown;
            public const string LastName = General.Unknown;
            public const string PhoneNumber = General.Unknown;
            public const string State = "XX";
            public const string Zip = "00000";
        }

        public static class Roles
        {
            public const string MyScoreRole = "ubilabsusr-01";
            public const string LabsAdminRole = "ubilabsadm-01";
            public const string OpsAdmin = "OpsAdmin";
            public const string OpsUser = "OpsUser";
            public const string SupportAdmin = "SupportAdmin";
            public const string Theft = "Theft";
            public const string TheftOnly = "TheftOnly";
            public const string MobileRegistrationAdmin = "MobileRegistrationAdmin";
            public const string ChangeAppAssignment = "ChangeAppAssignment";
            public const string FeeReversal = "FeeReversal";
            public const string FeeReversalOnly = "FeeReversalOnly";
            public const string CommercialLineRole = "CommercialLineRole";
            public const string Eligibility = "Eligibility";
            public const string InsertInitialParticipationScoreInProcess = "InsertInitialParticipationScoreInProcess";
            public const string OptOutSuspension = "OptOutSuspension";
            public const string PolicyMerge = "PolicyMerge";
            public const string ResetEnrollment = "ResetEnrollment";
            public const string StopShipment = "StopShipment";
            public const string UpdatePProGuid = "UpdatePProGuid";
            public const string VehicleSupport = "VehicleSupport";
        }

        public static class ParticipantGroupTypes
        {
            // Circle of friends
            public const int COF = 2;
        }

        public static class ConversionConstants
        {
            public const decimal KilometersToMiles = 0.621371M;
        }

        public static class FulfillmentConstants
        {
            public const int NumberOfDaysForOldOrder = 5;
        }

        public static class UBIConfigSections
        {
            public const string AppSettings = "AppSettings";


            public static class UBIConfigKeys
            {
                public const string cCodeTableManagerExpirationSeconds = "CodeTableManagerExpirationSeconds";
            }
        }

        public static class CodeTableDataSetTables
        {
            public const string cDevicePrepCodeTablesDataSetName = "DevicePrepCodeTablesDataSet";
            public const string cXirgoLotType = "XirgoLotType";
            public const string cDeviceLotStatus = "XirgoLotStatus";
            public const string cFirmwareType = "XirgoFirmwareType";
            public const string cFirmwareTypeVersion = "XirgoFirmwareTypeVersion";
            public const string cBenchTestDeviceStatus = "XirgoBenchTestDeviceStatus";
            public const string cCalculatorVersion = "CalculatorVersion";
            public const string cProduct = "XirgoVersion";
            public const string cDeviceRule = "XirgoRule";
        }
    }

    public static class TMXDeviceStatus
    {
        public const int Available = 1;
        public const int Inactive = 2;
        public const int Assigned = 3;
        public const int Abandoned = 4;
        public const int CustomerReturn = 5;
        public const int Unavailable = 6;
        public const int Defective = 7;
        public const int Batched = 8;
        public const int ReadyForPrep = 9;
        public const int ReadyForBenchTest = 10;
    }

    public static class TMXDeviceFeature
    {
        public const int IOTDevice = 6;
    }


    public static class LoggingConstants
    {
        public const string AppName = "AppName";
        public const string CompatibilitySeqId = "CompatibilitySeqId";
        public const string DeviceSerialNumber = "DeviceSerialNumber";
        public const string DeviceSeqId = "DeviceSeqId";
        public const string GroupExternalId = "GroupExternalId";
        public const string MobileRegistrationCode = "MobileRegistrationCode";
        public const string MobileRegistrationSeqId = "MobileRegistrationSeqId";
        public const string ParticipantId = "ParticipantId";
        public const string ParticipantExternalId = "ParticipantExternalId";
        public const string ParticipantSeqId = "ParticipantSeqId";
        public const string PolicyExpirationYear = "PolicyExpirationYear";
        public const string PolicyNumber = "PolicyNumber";
        public const string PolicySuffix = "PolicySuffix";
        public const string ProgramCode = "ProgramCode";
        public const string RegistrationStatusUpdateAction = "RegistrationStatusUpdateAction";
        public const string TelematicsId = "TelematicsId";
        public const string TelematicsIdList = "TelematicsIds";
        public const string DriverReferenceId = "DriverReferenceId";
        public const string DeviceExperienceType = "DeviceExperienceType";
        public const string SnapshotEnrollmentAction = "SnapshotEnrollmentAction";
        public const string PhoneNumber = "PhoneNumber";
        public const string Reason = "Reason";
    }
}

