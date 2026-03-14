using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface ISimManagementDAL
    {
        Task ActivateOrDeactivateLot(IEnumerable<SimManagementRecord> records);
    }

    public class SimManagementDAL : DbContext, ISimManagementDAL
    {
        public SimManagementDAL(
            ILogger<SimManagementDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsHomebase)
        {
        }

        public async Task ActivateOrDeactivateLot(IEnumerable<SimManagementRecord> records)
        {
            const string storedProc = "[dbo].[usp_SimManagement_UpdateByLot]";

            var table = new DataTable();
            table.Columns.Add("SIM", typeof(string));
            table.Columns.Add("EffectiveDate", typeof(DateTime));
            table.Columns.Add("Action", typeof(string));
            table.Columns.Add("NewRecordStatus", typeof(string));

            foreach (var record in records)
            {
                table.Rows.Add(record.SIM, record.EffectiveDate, record.Action == (int)ActivationAction.Activate ? "Activate" : "Deactivate", record.NewRecordStatus);
            }

            var parms = new DynamicParameters();
            parms.Add("@Parm_SimRecords", table.AsTableValuedParameter("dbo.SimManagementTVP"));

            var result = await ExecuteNonQueryAsync(storedProc, parms);
        }
    }
}
