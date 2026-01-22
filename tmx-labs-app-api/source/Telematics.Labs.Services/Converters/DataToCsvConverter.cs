//using Progressive.Telematics.Labs.Business.Resources;
//using System.Collections.Generic;
//using System.Data;
//using System.IO;
//using System.Text;

//namespace Progressive.Telematics.Labs.Services.Converters
//{
//	public class DataToCsvConverter
//	{
//		public MemoryStream TripEventListToCsv(List<TripEvent> data)
//		{
//			StringBuilder csvContent = new StringBuilder();

//			csvContent.AppendLine("Event Date Time, Speed(MPH), Event Description");
			
//			foreach (TripEvent row in data)
//			{
//				string time = EscapeCsvValue(row.EventDate.ToString("MM/dd/yyyy,hh:mm:ss tt"));
//				string speed = row.Speed.ToString();
//				string description = row.Description;
//				csvContent.AppendLine($"{time},{speed},{description}");
//			}
//			return createStream(csvContent);
//		}

//		public MemoryStream TripSummaryListToCsv(List<TripSummaryDaily> data)
//		{
//			StringBuilder csvContent = new StringBuilder();
//			csvContent.AppendLine("Trip SeqID,Trip Start,Trip End,Trip Duration,Trip Mileage,Hard Brakes,Hard Accels,High Risk Seconds");

//			foreach (TripSummaryDaily row in data)
//			{
//				string tripSeqId = row.SeqId.ToString();
//				string tripStart = EscapeCsvValue(row.TripDate.ToString("MM/dd/yyyy,hh:mm:ss tt"));
//				string tripEnd = EscapeCsvValue(row.TripEndDate.ToString("MM/dd/yyyy,hh:mm:ss tt"));
//				string tripDuration = row.Duration.ToString();
//				string tripMileage = row.Mileage.ToString();
//				string hardBreaks = row.HardBrakes.ToString();
//				string hardAcells = row.HardAccelerations.ToString();
//				string highRiskSec = row.HighRiskSeconds.ToString();
//				csvContent.AppendLine($"{tripSeqId},{tripStart},{tripEnd},{tripDuration},{tripMileage},{hardBreaks},{hardAcells},{highRiskSec}");
//			}
//			return createStream(csvContent);
//		}

//		public MemoryStream ParticipantDeviceDetailsListToCSV(List<ParticipantDeviceTripEvent> data)
//		{
//			StringBuilder csvContent = new StringBuilder();
//			csvContent.AppendLine("Event SeqId, Event Date, Event Description, Event Code, Protocol Code, VIN, Odometer, Create Date");
//			foreach (ParticipantDeviceTripEvent row in data)
//			{
//				string seqId = row.EventSeqId.ToString();
//				string eventTime = EscapeCsvValue(row.EventTime.ToString("MM/dd/yyyy,hh:mm:ss tt"));
//				string desc = row.EventDescription;
//				string code = row.EventCode.ToString();
//				string protoCode = row.ProtocolCode.ToString();
//				string vin = row.VIN.ToString();
//				string odometer = row.OdometerReading.ToString();
//				string createDate = "";
//				if (row.CreateDate.HasValue)
//				{
//					var value = row.CreateDate.Value;
//					createDate = EscapeCsvValue(value.ToString("MM/dd/yyyy,hh:mm:ss tt"));
//				}
//				csvContent.AppendLine($"{seqId},{eventTime},{desc},{code},{protoCode},{vin},{odometer},{createDate}");
//			}
//			return createStream(csvContent);
//		}

//		public MemoryStream TransAuditLogListToCsv(List<TransactionAuditLog> data)
//		{
//			StringBuilder csvContent = new StringBuilder();
//			csvContent.AppendLine("Transaction Audit SeqID,Create Date,Policy #,Result Status,Result Message,Transaction Name,Transaction Data,Resolution Status,Resolution Comments");
//			foreach (TransactionAuditLog row in data)
//			{
//				string seqId = row.TransactionAuditSeqId.ToString();
//				string eventTime = EscapeCsvValue(row.CreateDate.ToString("MM/dd/yyyy,hh:mm:ss tt"));
//				string policy = row.PolicyNumber;
//				string status = row.ResultStatus;
//				string message = row.ResultMessage;
//				string tranName = row.TransactionName;
//				string tranData = row.TransactionData;
//				string resolutionStatus = row.ResolutionStatus;
//				string resolutionComment = row.ResolutionComments;
//				csvContent.AppendLine($"{seqId},{eventTime},{policy},{status},{message},{tranName},{tranData},{resolutionStatus},{resolutionComment}");
//			}
//			return createStream(csvContent);
//		}

//		public MemoryStream ParticipantJunctionDataToCsv(IEnumerable<ParticipantJunction> data)
//		{
//			StringBuilder csvContent = new StringBuilder();
//			csvContent.AppendLine("Change Effective Date,Status,Rsn Code,YMM,VIN,participant SeqID,participant ID,Participant External Id," +
//				"Mobile Device Alias Name,Device Experience Type Code,Policy Period Seq ID,Policy Suffix,Inception Date,Expiration Date,Rate Revision," +
//				"vehicle Seq ID,Driver Seq ID,Device Seq ID,Homebase Device Seq ID, Device Serial Number,Pending Device Serial Number,Junction Version,Junction Version Seq,Scoring Algorithm Code,System Name");
//			foreach (ParticipantJunction row in data)
//			{
//				string effDate = EscapeCsvValue(row.ChangeEffectiveDate.ToString("MM/dd/yyyy,hh:mm:ss tt"));
//				string status = row.Status.ToString();
//				string rsnCode = row.ReasonCode.ToString();
//				string ymm = row.YMM;
//				string vin = row.VIN;
//				string participantSeqid = row.ParticipantSeqID.ToString();
//				string particpantId = row.ParticipantID.ToString();
//				string participantExtId = row.ParticipantExternalID.ToString();
//				string mobDevicAlias = row.MobileDeviceAliasName;
//				string deviceExpTypCd = row.DeviceExperienceTypeCode.ToString();
//				string polPerionSeqId = row.PolicyPeriodSeqID.ToString();
//				string policySfx = row.PolicySuffix.ToString();
//				string inceptionDate = row.InceptionDate.ToString("MM/dd/yyyy");
//				string expirationDate = row.ExpirationDate.ToString("MM/dd/yyyy");
//				string rateRev = row.RateRevision;
//				string vehSeqId = row.VehicleSeqID.ToString();
//				string drvrSeqId = row.DriverSeqID.ToString();
//				string deviceSeqId = row.DeviceSeqID.ToString();
//				string homeBaseDevicedSeqId = row.HomeBaseDeviceSeqID.ToString();
//				string deviceSerNmb = row.DeviceSerialNumber;
//				string pendingDeviceSerNbr = row.PendingDeviceSerialNumber;
//				string junctVersion = row.JunctionVersion.ToString();
//				string junctVersionSeq = row.JunctionVersionSeq.ToString();
//				string scoringAlg = row.ScoringAlgorithmCode.ToString();
//				string systmeName = row.SystemName;
//				csvContent.AppendLine($"{effDate},{status},{rsnCode},{ymm},{vin},{participantSeqid},{particpantId}," +
//					$"{participantExtId},{mobDevicAlias},{deviceExpTypCd},{polPerionSeqId},{policySfx},{inceptionDate},{expirationDate}," +
//					$"{rateRev},{vehSeqId},{drvrSeqId},{deviceSeqId},{homeBaseDevicedSeqId},{deviceSerNmb},{pendingDeviceSerNbr},{junctVersion}," +
//					$"{junctVersionSeq},{scoringAlg},{systmeName}");

//			}
//			return createStream(csvContent);
//		}

//		public MemoryStream DataTableToCsv(DataTable dataTable)
//		{
//			StringBuilder csvContent = new StringBuilder();

//			for (int i = 0; i < dataTable.Columns.Count; i++)
//			{
//				csvContent.Append(dataTable.Columns[i]);
//				if (i < dataTable.Columns.Count - 1)
//				{
//					csvContent.Append(",");
//				}
//			}
//			csvContent.AppendLine();

//			foreach (DataRow row in dataTable.Rows)
//			{
//				for (int i = 0; i < dataTable.Columns.Count; i++)
//				{
//					string data = row[i].ToString();
//					if (data.Contains(",")) data = EscapeCsvValue(data);
//					csvContent.Append(data);
//					if (i < dataTable.Columns.Count - 1)
//					{
//						csvContent.Append(",");
//					}
//				}
//				csvContent.AppendLine();
//			}

//			return createStream(csvContent);
//		}

//		private MemoryStream createStream(StringBuilder data)
//		{
//			MemoryStream memoryStream = new MemoryStream();
//			byte[] byteArray = Encoding.UTF8.GetBytes(data.ToString());
//			memoryStream.Write(byteArray, 0, byteArray.Length);
//			memoryStream.Position = 0;
//			return memoryStream;
//		}

//		private string EscapeCsvValue(string value)
//		{
//			if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
//			{
//				value = value.Replace("\"", "\"\"");
//				value = $"\"{value}\"";
//			}
//			return value;
//		}
//	}
//}

