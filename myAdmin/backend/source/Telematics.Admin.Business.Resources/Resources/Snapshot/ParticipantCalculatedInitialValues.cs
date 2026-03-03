using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class ParticipantCalculatedInitialValues : Resource
    {
        [JsonPropertyName("isInProcessitemReturned")]
        public bool IsInProcessitemReturned { get; set; }

        [JsonPropertyName("isEndorsementDiscountZero")]
        public bool IsEndorsementDiscountZero { get; set; }

        [JsonPropertyName("isScoreCalculated")]
        public bool IsScoreCalculated { get; set; }

        [JsonPropertyName("isEmailSent")]
        public bool IsEmailSent { get; set; }

        [JsonPropertyName("beginScoreCheckDate")]
        public DateTime BeginScoreCheckDate { get; set; }

        [JsonPropertyName("lastUpdateDate")]
        public DateTime LastUpdateDate { get; set; }

        [JsonPropertyName("endorsementAppliedDate")]
        public DateTime? EndorsementAppliedDate { get; set; }

        [JsonPropertyName("createDate")]
        public DateTime CreateDate { get; set; }

        [JsonPropertyName("scoreInfo")]
        public ParticipantCalculatedRenewalValues ScoreInfo { get; set; }
    }
}
