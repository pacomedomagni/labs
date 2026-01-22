using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IAccountDAL
    {
        Task<IEnumerable<AccountDataModel>> GetAccountsByParticipantGroupSeqId(int participantGroupSeqId);
        Task<AccountDataModel> GetAccountByParticipantSeqId(int participantSeqId); // new single account method
    }

    public class AccountDAL : DbContext, IAccountDAL
    {
        private readonly IHttpContextAccessor _contextAccessor;

        public AccountDAL(
            ILogger<AccountDAL> logger,
            IOptions<ConnectionStringsConfig> config,
            IOptions<EnvironmentPrefixes> envConfig,
            IHttpContextAccessor contextAccessor)
            : base(logger, envConfig.Value.SQL, config.Value.LabsMyScore)
        {
            _contextAccessor = contextAccessor;
        }

        async Task<IEnumerable<AccountDataModel>> IAccountDAL.GetAccountsByParticipantGroupSeqId(int participantGroupSeqId)
        {
            var storedProc = "dbo.usp_Account_SelectByParticipantGroupSeqId";
            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantGroupSeqID", participantGroupSeqId);
            var detail = await getDetailTable(storedProc, parms);
            if (detail == null) return Enumerable.Empty<AccountDataModel>();
            return detail.Rows.Cast<DataRow>()
                .Select(r => MapRow(r, detail))
                .Where(a => a.ParticipantGroupSeqID != 0 && a.IsActive == 1)
                .ToList();
        }

        async Task<AccountDataModel> IAccountDAL.GetAccountByParticipantSeqId(int participantSeqId)
        {
            const string storedProc = "dbo.usp_Account_SelectByParticipantSeqId";
            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantSeqID", participantSeqId);
            var detail = await getDetailTable(storedProc, parms);
            if (detail == null || detail.Rows.Count == 0)
            {
                return null;
            }

            var row = detail.Rows.Cast<DataRow>()
                .FirstOrDefault(r => TryConvertInt(r, detail, "ParticipantSeqID") == participantSeqId)
                ?? detail.Rows.Cast<DataRow>().FirstOrDefault();

            if (row == null)
            {
                return null;
            }

            var resolvedParticipantSeqId = TryConvertInt(row, detail, "ParticipantSeqID");
            if (resolvedParticipantSeqId != participantSeqId)
            {
                logger?.LogWarning("{StoredProc} returned participant {ResolvedParticipantSeqId} when looking up participant {RequestedParticipantSeqId}",
                    storedProc,
                    resolvedParticipantSeqId,
                    participantSeqId);
            }

            return MapRow(row, detail);
        }

        private async Task<DataTable> getDetailTable(string storedProc, DynamicParameters parms)
        {
            var tables = await ExecuteDataFillAsync(storedProc, parms);
            //stored procedure returns two tables, detail is either the second table or the first if only one table is returned(detail is what we want)
            if (tables == null || tables.Count == 0) return null;
            return tables.Count > 1 ? tables[1] : tables.FirstOrDefault(t => t.Columns.Contains("ParticipantSeqID"));
        }

        private static AccountDataModel MapRow(DataRow r, DataTable table)
        {
            int ToInt(string col) => TryConvertInt(r, table, col) ?? 0;
            int? ToIntN(string col) => TryConvertInt(r, table, col);
            DateTime? ToDate(string col) => TryConvertDate(r, table, col);
            string ToStr(string col) => TryConvertString(r, table, col);

            return new AccountDataModel
            {
                ParticipantSeqID = ToInt("ParticipantSeqID"),
                ParticipantGroupSeqID = ToInt("ParticipantGroupSeqID"),
                VehicleSeqID = ToIntN("VehicleSeqID"),
                DeviceSeqID = ToIntN("DeviceSeqID"),
                ParticipantStatusCode = ToIntN("ParticipantStatusCode"),
                ScoreCalculatorCode = ToIntN("ScoreCalculatorCode"),
                LastUpdateDateTime = ToDate("LastUpdateDateTime"),
                ParticipantCreateDateTime = ToDate("ParticipantCreateDateTime"),
                Nickname = ToStr("Nickname"),
                ScoringAlgorithmCode = ToIntN("ScoringAlgorithmCode"),
                DriverSeqId = ToIntN("DriverSeqId"),
                ParticipantExternalID = ToStr("ParticipantExternalID"),
                MobileSummarizerVersionCode = ToIntN("MobileSummarizerVersionCode"),
                DeviceExperienceTypeCode = ToIntN("DeviceExperienceTypeCode"),
                ParticipantId = ToStr("ParticipantId"),
                IsActive = ToIntN("IsActive"),
                VIN = ToStr("VIN"),
                Year = ToIntN("Year"),
                Make = ToStr("Make"),
                Model = ToStr("Model"),
                VehicleCreateDateTime = ToDate("VehicleCreateDateTime"),
                DriverExternalId = ToStr("DriverExternalId"),
                DeviceReceivedDateTime = ToDate("DeviceReceivedDateTime"),
                DeviceReturnReasonCode = ToIntN("DeviceReturnReasonCode"),
                DeviceAbandonedDateTime = ToDate("DeviceAbandonedDateTime"),
                DeviceSerialNumber = ToStr("DeviceSerialNumber"),
                SIM = ToStr("SIM"),
                DeviceStatusCode = ToIntN("DeviceStatusCode"),
                DeviceLocationCode = ToIntN("DeviceLocationCode"),
                DeviceManufacturer = ToStr("DeviceManufacturer"),
                DeviceTypeDescription = ToStr("DeviceTypeDescription"),
                ReportedVIN = ToStr("ReportedVIN"),
                DeviceShipDateTime = ToDate("DeviceShipDateTime"),
                FirstContactDateTime = ToDate("FirstContactDateTime"),
                LastContactDateTime = ToDate("LastContactDateTime"),
                LastUploadDateTime = ToDate("LastUploadDateTime")
            };
        }

        private static int? TryConvertInt(DataRow r, DataTable table, string col)
        {
            var column = FindColumn(table, col);
            if (column == null || r[column] == DBNull.Value) return null;
            try { return Convert.ToInt32(r[column]); } catch { return null; }
        }

        private static DateTime? TryConvertDate(DataRow r, DataTable table, string col)
        {
            var column = FindColumn(table, col);
            if (column == null || r[column] == DBNull.Value) return null;
            try { return Convert.ToDateTime(r[column]); } catch { return null; }
        }

        private static string TryConvertString(DataRow r, DataTable table, string col)
        {
            var column = FindColumn(table, col);
            if (column == null || r[column] == DBNull.Value) return null;
            return r[column].ToString();
        }

        private static DataColumn FindColumn(DataTable table, string columnName)
        {
            if (table == null || string.IsNullOrWhiteSpace(columnName))
            {
                return null;
            }

            return table.Columns
                .Cast<DataColumn>()
                .FirstOrDefault(column => column.ColumnName.Equals(columnName, StringComparison.OrdinalIgnoreCase));
        }
    }
}
