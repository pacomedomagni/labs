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
    public interface IDeviceActivityDAL
    {
        /// <summary>
        /// Bulk insert device activity records
        /// </summary>
        /// <param name="activities">List of device activities to insert</param>
        /// <returns>Number of rows inserted</returns>
        Task<int> BulkInsertDeviceActivities(IEnumerable<DeviceActivityBulkInsertModel> activities);
    }

    public class DeviceActivityDAL : DbContext, IDeviceActivityDAL
    {
        private readonly string _connectionString;

        public DeviceActivityDAL(
            ILogger<DeviceActivityDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsHomebase)
        {
            _connectionString = connectionStrings.Value.LabsHomebase.InsertEnvironmentType(envConfig.Value.SQL);
        }

        public async Task<int> BulkInsertDeviceActivities(IEnumerable<DeviceActivityBulkInsertModel> activities)
        {
            var activityList = activities?.ToList();
            if (activityList == null || activityList.Count == 0)
                return 0;

            const string storedProc = "dbo.usp_DeviceActivity_BulkInsert";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var dataTable = new DataTable();
            dataTable.Columns.Add("DeviceSeqID", typeof(int));
            dataTable.Columns.Add("Description", typeof(string));

            foreach (var activity in activityList)
            {
                dataTable.Rows.Add(activity.DeviceSeqID, activity.Description);
            }

            var parms = new DynamicParameters();
            parms.Add("@Parm_DeviceActivities", dataTable.AsTableValuedParameter("dbo.DeviceActivityBulkInsertType"));

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
                logger.LogError(LoggingEvents.SqlException, ex, "Exception during bulk insert of device activities");
                throw;
            }
        }
    }
}
