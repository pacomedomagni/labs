using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class InitialParticipantScoreInProcess : Resource
    {
        [JsonPropertyName("participantSeqId")]
        [Column("ParticipantSeqID")]
        public int ParticipantSeqId { get; set; }

        [JsonPropertyName("isEndorsementDiscountZero")]
        public bool IsEndorsementDiscountZero { get; set; }

        [JsonPropertyName("isScoreCalculated")]
        public bool IsScoreCalculated { get; set; }

        [JsonPropertyName("isEmailSent")]
        public bool IsEmailSent { get; set; }

        [JsonPropertyName("beginScoreCheckDate")]
        [Column("BeginScoreCheckDateTime")]
        public DateTime BeginScoreCheckDate { get; set; }

        [JsonPropertyName("lastUpdateDate")]
        [Column("LastUpdateDateTime")]
        public DateTime LastUpdateDate { get; set; }

        [JsonPropertyName("createDate")]
        public DateTime CreateDate { get; set; }

        [JsonPropertyName("endorsementAppliedDate")]
        [Column("EndorsementAppliedDateTime")]
        public DateTime? EndorsementAppliedDate { get; set; }

        [JsonPropertyName("enrollmentDate")]
        public DateTime? EnrollmentDate { get; set; }
    }
}
