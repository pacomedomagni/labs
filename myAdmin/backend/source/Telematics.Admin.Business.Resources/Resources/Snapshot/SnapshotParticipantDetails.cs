using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Business.Resources.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class SnapshotParticipantDetails : Resource
    {
        [JsonPropertyName("participantId")]
        public string ParticipantId { get; set; }

        [JsonPropertyName("participantSeqId")]
        public int ParticipantSeqId { get; set; }

        [JsonPropertyName("status")]
        public ParticipantStatus Status { get; set; }

        [JsonPropertyName("reasonCode")]
        public ParticipantReasonCode ReasonCode { get; set; }

        [JsonPropertyName("programType")]
        public ProgramType ProgramType { get; set; }

        [JsonPropertyName("scoringAlgorithmCode")]
        public int? ScoringAlgorithmCode { get; set; }

        [JsonPropertyName("scoringAlgorithmData")]
        public ScoringAlgorithmData ScoringAlgorithmData { get; set; }

        [JsonPropertyName("monitoringCompleteConnectDays")]
        public int MonitoringCompleteConnectDays { get; set; }

        [JsonPropertyName("enrollmentExperience")]
        public DeviceExperience EnrollmentExperience { get; set; }

        [JsonPropertyName("initialFirstContactDateTime")]
        public DateTime? InitialFirstContactDateTime { get; set; }

        [JsonPropertyName("firstContactDateTime")]
        public DateTime? FirstContactDateTime { get; set; }

        [JsonPropertyName("lastContactDateTime")]
        public DateTime? LastContactDateTime { get; set; }

        [JsonPropertyName("lastUploadDateTime")]
        public DateTime? LastUploadDateTime { get; set; }

        [JsonPropertyName("trialStartDate")]
        public DateTime? TrialStartDate { get; set; }

        [JsonPropertyName("enrollmentDate")]
        public DateTime? EnrollmentDate { get; set; }

        [JsonPropertyName("policyStartDate")]
        public DateTime? PolicyStartDate { get; set; }

        [JsonPropertyName("changeEffectiveDate")]
        public DateTime? ChangeEffectiveDate { get; set; }

        [JsonPropertyName("vehicleDetails")]
        public Vehicle VehicleDetails { get; set; }

        [JsonPropertyName("optOutDetails")]
        public OptOutData? OptOutDetails { get; set; }

        [JsonPropertyName("communications")]
        public List<Communication> Communications { get; set; }

        [JsonPropertyName("billingTransactions")]
        public List<BillingTransaction> BillingTransactions { get; set; }

        [JsonPropertyName("compatibilityIssues")]
        public List<CompatibilityItem> CompatibilityIssues { get; set; }
    }
}
