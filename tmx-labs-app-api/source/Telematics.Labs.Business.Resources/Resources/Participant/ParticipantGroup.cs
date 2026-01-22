using System;
using System.Data;
using System.Runtime.Serialization;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Participant;

    public class ParticipantGroup :Resource
    {
		public ParticipantGroup() { }

		public ParticipantGroup(DataRow row)
		{
			ParticipantGroupSeqID = Convert.ToInt32(row["ParticipantGroupSeqID"]);
			ParticipantGroupExternalKey = row["ParticipantGroupExternalKey"].ToString();
			ParticipantGroupTypeCode = Convert.ToInt16(row["ParticipantGroupTypeCode"]);

			if (row.Table.Columns["CreateDateTime"] != null)
			{
				if (!DBNull.Value.Equals(row["CreateDateTime"]))
				{
					CreateDateTime = (DateTime)row["CreateDateTime"];
				}
			}
			else if (row.Table.Columns["ParticipantGroupCreateDateTime"] != null)
			{
				if (!DBNull.Value.Equals(row["ParticipantGroupCreateDateTime"]))
				{
					CreateDateTime = (DateTime)row["ParticipantGroupCreateDateTime"];
				}
			}
		}
		public int ParticipantGroupSeqID { get; set; }
		public string ParticipantGroupExternalKey { get; set; }
		public DateTime CreateDateTime { get; set; }
		public int ParticipantGroupTypeCode { get; set; }
}
