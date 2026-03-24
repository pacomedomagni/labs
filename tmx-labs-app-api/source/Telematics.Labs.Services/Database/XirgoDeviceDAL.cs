using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared;
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
    public interface IXirgoDeviceDAL
    {
        /// <summary>
        /// Bulk update XirgoDevice records
        /// </summary>
        /// <param name="devices">List of device updates to apply</param>
        /// <returns>Number of rows updated</returns>
        Task<int> BulkUpdateXirgoDevices(IEnumerable<XirgoDeviceBulkUpdateModel> devices);
    }

    public class XirgoDeviceDAL : DbContext, IXirgoDeviceDAL
    {
        private readonly string _connectionString;

        public XirgoDeviceDAL(
            ILogger<XirgoDeviceDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsHomebase)
        {
            _connectionString = connectionStrings.Value.LabsHomebase.InsertEnvironmentType(envConfig.Value.SQL);
        }

        public async Task<int> BulkUpdateXirgoDevices(IEnumerable<XirgoDeviceBulkUpdateModel> devices)
        {
            var deviceList = devices?.ToList();
            if (deviceList == null || deviceList.Count == 0)
                return 0;

            const string storedProc = "dbo.usp_XirgoDevice_BulkUpdate";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var dataTable = new DataTable();
            dataTable.Columns.Add("DeviceSeqID", typeof(int));
            dataTable.Columns.Add("IsCommunicationAllowed", typeof(bool));
            dataTable.Columns.Add("StatusCode", typeof(byte));
            dataTable.Columns.Add("LocationCode", typeof(int));
            dataTable.Columns.Add("ReportedVIN", typeof(string));
            dataTable.Columns.Add("WTFStateInfo", typeof(string));
            dataTable.Columns.Add("ReportedProtocolCode", typeof(int));
            dataTable.Columns.Add("LastRemoteResetDateTime", typeof(DateTime));

            foreach (var device in deviceList)
            {
                dataTable.Rows.Add(
                    device.DeviceSeqID,
                    device.IsCommunicationAllowed ?? (object)DBNull.Value,
                    device.StatusCode ?? (object)DBNull.Value,
                    device.LocationCode ?? (object)DBNull.Value,
                    device.ReportedVIN ?? (object)DBNull.Value,
                    device.WTFStateInfo ?? (object)DBNull.Value,
                    device.ReportedProtocolCode ?? (object)DBNull.Value,
                    device.LastRemoteResetDateTime ?? (object)DBNull.Value);
            }

            var parms = new DynamicParameters();
            parms.Add("@Parm_Devices", dataTable.AsTableValuedParameter("dbo.XirgoDeviceBulkUpdateType"));

            try
            {
                var result = await connection.QuerySingleAsync<int>(
                    storedProc,
                    parms,
                    commandType: CommandType.StoredProcedure);
                return result;
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.SqlException, ex, "Exception during bulk update of Xirgo devices");
                throw;
            }
        }
    }
}
