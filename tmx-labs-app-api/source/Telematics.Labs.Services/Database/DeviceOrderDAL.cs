using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceOrder;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IDeviceOrderDAL
    {
        /// <summary>
        /// Get Device Orders for a Participant Group
        /// </summary>
        /// <param name="participantGroupSeqId">Participant Group Seq ID</param>
        /// <returns></returns>
        Task<IEnumerable<DeviceOrderDetails>> GetDeviceOrdersByParticipantGroupSeqId(int participantGroupSeqId);

        Task<DeviceOrderCreationResult> CreateReplacementOrder(CreateReplacementDeviceOrderModel model);

        /// <summary>
        /// Get count of device orders processed today
        /// </summary>
        /// <returns>Count of processed orders</returns>
        Task<int> ProcessedOrderCount();

    }

    public class DeviceOrderDAL : DbContext, IDeviceOrderDAL
    {
        public DeviceOrderDAL(
            ILogger<DeviceOrderDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsMyScore)
        {
        }

        public async Task<IEnumerable<DeviceOrderDetails>> GetDeviceOrdersByParticipantGroupSeqId(int participantGroupSeqId)
        {
            const string storedProc = "dbo.usp_DeviceOrderDetails_SelectByParticipantGroup";

            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantGroupSeqID", participantGroupSeqId, dbType: DbType.Int32);

            return await ExecuteStoredProcedureAsync<DeviceOrderDetails>(storedProc, parms);
        }

        public async Task<DeviceOrderCreationResult> CreateReplacementOrder(CreateReplacementDeviceOrderModel model)
        {
            if (model == null)
            {
                throw new ArgumentNullException(nameof(model));
            }

            const string storedProc = "dbo.usp_DeviceOrder_InsertWithDetail";

            var parameters = new DynamicParameters()
                .Parameter("@Parm_DeviceOrderSeqID", dbType: DbType.Int32, direction: ParameterDirection.Output)
                .Parameter("@Parm_ParticipantGroupSeqID", model.ParticipantGroupSeqId, DbType.Int32)
                .Parameter("@Parm_DetailTable", CreateDetailTable(model).AsTableValuedParameter("[dbo].[DeviceOrderDetailTableType]"));

            var resultSets = await ExecuteDataFillAsync(storedProc, parameters);

            var orderSeqId = parameters.Get<int>("@Parm_DeviceOrderSeqID");
            var detailIds = ExtractDetailIds(resultSets);

            return new DeviceOrderCreationResult
            {
                DeviceOrderSeqId = orderSeqId,
                DeviceOrderDetailSeqIds = detailIds,
            };
        }
        
        public async Task<int> ProcessedOrderCount()
        {
            const string storedProc = "dbo.usp_DeviceOrder_CountOfProcessedToday";

            var parms = new DynamicParameters();

            return await ExecuteScalarAsync<int>(storedProc, parms);
        }

        private static DataTable CreateDetailTable(CreateReplacementDeviceOrderModel model)
        {
            var table = new DataTable("DeviceOrderDetailTableType");
            table.Columns.Add("VIN", typeof(string));
            table.Columns.Add("Year", typeof(short));
            table.Columns.Add("Make", typeof(string));
            table.Columns.Add("Model", typeof(string));
            table.Columns.Add("ParticipantSeqID", typeof(int));
            table.Columns.Add("VehicleSeqID", typeof(int));
            table.Columns.Add("IsReplacementOrder", typeof(bool));

            var row = table.NewRow();
            row["VIN"] = string.IsNullOrWhiteSpace(model.Vin) ? (object)DBNull.Value : model.Vin.Trim();
            row["Year"] = model.Year.HasValue ? (object)model.Year.Value : DBNull.Value;
            row["Make"] = string.IsNullOrWhiteSpace(model.Make) ? (object)DBNull.Value : model.Make.Trim();
            row["Model"] = string.IsNullOrWhiteSpace(model.Model) ? (object)DBNull.Value : model.Model.Trim();
            row["ParticipantSeqID"] = model.ParticipantSeqId;
            row["VehicleSeqID"] = model.VehicleSeqId;
            row["IsReplacementOrder"] = true;
            table.Rows.Add(row);

            return table;
        }

        private static int[] ExtractDetailIds(IReadOnlyList<DataTable> resultSets)
        {
            if (resultSets == null || resultSets.Count == 0)
            {
                return Array.Empty<int>();
            }

            var firstTable = resultSets[0];

            if (!firstTable.Columns.Contains("DeviceOrderDetailSeqID"))
            {
                return Array.Empty<int>();
            }

            return firstTable
                .AsEnumerable()
                .Select(row => row.Field<int?>("DeviceOrderDetailSeqID"))
                .Where(id => id.HasValue)
                .Select(id => id.Value)
                .ToArray();
        }
    }
}
