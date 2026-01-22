
using System.Runtime.InteropServices;
using Progressive.WAM.Token.Inspector.Extensions;

namespace Progressive.Telematics.Labs.Shared
{
    public static class Constants
    {
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

