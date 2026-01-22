using System;
using System.Data;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
public class ParticipantInfo : Resource
{
    public ParticipantInfo() { }

    public ParticipantInfo(DataRow row)
    {
        ParticipantSeqID = Convert.ToInt32(row["ParticipantSeqID"].ToString());
        ParticipantGroupSeqID = Convert.ToInt32(row["ParticipantGroupSeqID"].ToString());
        VehicleSeqID = Convert.ToInt32(row["VehicleSeqID"].ToString());
        ParticipantStatusCode = Convert.ToInt32(row["ParticipantStatusCode"].ToString());
        ScoreCalculatorCode = Convert.ToInt32(row["ScoreCalculatorCode"].ToString());
        LastUpdateDateTime = Convert.ToDateTime(row["LastUpdateDateTime"].ToString());
        if (row.Table.Columns["CreateDateTime"] != null)
        {
            if (!DBNull.Value.Equals(row["CreateDateTime"]))
            {
                CreateDateTime = (DateTime)row["CreateDateTime"];
            }
        }
        else if (row.Table.Columns["ParticipantCreateDateTime"] != null)
        {
            if (!DBNull.Value.Equals(row["ParticipantCreateDateTime"]))
            {
                CreateDateTime = (DateTime)row["ParticipantCreateDateTime"];
            }
        }
        if (row["Nickname"] is DBNull)
        { }
        else
        {
            Nickname = (row["Nickname"].ToString());
        }
        if (row["DeviceSeqID"] is DBNull)
        { }
        else
        {
            DeviceSeqID = Convert.ToInt32(row["DeviceSeqID"].ToString());
        }

        if (row.Table.Columns["ScoringAlgorithmCode"] != null)
        {
            if (!DBNull.Value.Equals(row["ScoringAlgorithmCode"]))
            {
                ScoringAlgorithmCode = (int)row["ScoringAlgorithmCode"];
            }
        }

        DeviceExperienceTypeCode = row.Field<int?>("DeviceExperienceTypeCode") == null ? 1 : row.Field<int>("DeviceExperienceTypeCode");
        MobileSummarizerVersionCode = row.Field<int?>("MobileSummarizerVersionCode");
        if (row.Table.Columns.Contains("DriverExternalId"))
        {
            DriverExternalId = row.Field<string>("DriverExternalId");
        }

        ParticipantExternalId = row.Field<string>("ParticipantExternalId");
        DriverSeqId = row.Field<int?>("DriverSeqId");

        if (row.Table.Columns.Contains("ParticipantId"))
        {
            ParticipantId = row.Field<System.Guid>("ParticipantId");
        }
    }
    public int ParticipantSeqID { get; set; }
    public int ParticipantGroupSeqID { get; set; }
    public int VehicleSeqID { get; set; }
    public int ParticipantStatusCode { get; set; }
    public int ScoreCalculatorCode { get; set; }
    public DateTime LastUpdateDateTime { get; set; }
    public DateTime CreateDateTime { get; set; }
    public string Nickname = null;
    public int? DeviceSeqID = null;
    public int? ScoringAlgorithmCode = null;
    public int? MobileSummarizerVersionCode { get; set; }
    public int DeviceExperienceTypeCode { get; set; }

    public int? DriverSeqId = null;

    public string ParticipantExternalId = null;

    public string DriverExternalId = null;

    public Guid? ParticipantId = null;

}
