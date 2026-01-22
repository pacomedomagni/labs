using Azure.Core;
using Dapper;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceReturn;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using WcfXirgoService;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IDeviceReturnDAL
    {
        Task AddDeviceReturn(AddDeviceReturnModel model);
        Task<DeviceReturnModel> GetDeviceReturn(GetDeviceReturnModel model);
        Task UpdateDeviceReturn(UpdateDeviceReturnModel model);
        Task<IEnumerable<DeviceReturnByDeviceModel>> GetLatestByDeviceSeqIds(IEnumerable<int> deviceSeqIds);
    }

    public class DeviceReturnDAL : DbContext, IDeviceReturnDAL
    {
        public DeviceReturnDAL(
            ILogger<DeviceReturnDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsMyScore)
        {
        }

        public async Task AddDeviceReturn(AddDeviceReturnModel model)
        {
            const string storedProc = "dbo.usp_DeviceReturn_Insert";

            var parms = new DynamicParameters()
                .Parameter("@Parm_DeviceSeqID", model.DeviceReturn.DeviceSeqID, DbType.Int32)
                .Parameter("@Parm_ParticipantSeqID", model.DeviceReturn.ParticipantSeqID, DbType.Int32)
                .Parameter("@Parm_DeviceReturnReasonCode", model.DeviceReturn.DeviceReturnReasonCode, DbType.Int16)
                .Parameter("@Parm_VehicleSeqID", model.DeviceReturn.VehicleSeqID, DbType.Int32)
                .Parameter("@Parm_DeviceReceivedDateTime", model.DeviceReturn.DeviceReceivedDateTime, DbType.DateTime)
                .Parameter("@Parm_DeviceAbandonedDateTime", model.DeviceReturn.DeviceAbandonedDateTime,
                    DbType.DateTime);

            await ExecuteStoredProcedureAsync<DeviceReturnModel>(storedProc, parms);
        }

        public async Task UpdateDeviceReturn(UpdateDeviceReturnModel model)
        {
            const string storedProc = "dbo.usp_DeviceReturn_UpdateByPrimaryKey";

            var parms = new DynamicParameters()
                .Parameter("@Parm_DeviceSeqID", model.DeviceReturn.DeviceSeqID, DbType.Int32)
                .Parameter("@Parm_ParticipantSeqID", model.DeviceReturn.ParticipantSeqID, DbType.Int32)
                .Parameter("@Parm_DeviceReturnReasonCode", model.DeviceReturn.DeviceReturnReasonCode, DbType.Int16)
                .Parameter("@Parm_VehicleSeqID", model.DeviceReturn.VehicleSeqID, DbType.Int32)
                .Parameter("@Parm_DeviceReceivedDateTime", model.DeviceReturn.DeviceReceivedDateTime, DbType.DateTime)
                .Parameter("@Parm_DeviceAbandonedDateTime", model.DeviceReturn.DeviceAbandonedDateTime, DbType.DateTime);

            await ExecuteNonQueryAsync(storedProc, parms);
        }

        public async Task<DeviceReturnModel> GetDeviceReturn(GetDeviceReturnModel model)
        {
            const string storedProc = "dbo.usp_DeviceReturn_SelectByPrimaryKey";

            var parms = new DynamicParameters()
                .Parameter("@Parm_DeviceSeqID", model.DeviceSeqID, DbType.Int32)
                .Parameter("@Parm_ParticipantSeqID", model.ParticipantSeqID, DbType.Int32);

            var result = await ExecuteStoredProcedureAsync<DeviceReturnModel>(storedProc, parms);
            var recordCount = result.Count();

            if (recordCount == 1)
            {
                return result.First();
            }
            else if (recordCount > 1)
            {
                throw new Exception("Received more than one record. Expected only one.");
            }

            return null;
        }

        public async Task<IEnumerable<DeviceReturnByDeviceModel>> GetLatestByDeviceSeqIds(IEnumerable<int> deviceSeqIds)
        {
            var ids = (deviceSeqIds ?? Enumerable.Empty<int>())
                .Distinct()
                .ToArray();

            if (ids.Length == 0)
            {
                return Enumerable.Empty<DeviceReturnByDeviceModel>();
            }

            const string storedProc = "dbo.usp_DeviceReturn_SelectByDevice";

            var returns = new List<DeviceReturnByDeviceModel>(ids.Length);

            foreach (var deviceSeqId in ids)
            {
                var parameters = new DynamicParameters()
                    .Parameter("@Parm_DeviceSeqID", deviceSeqId);

                var record = (await ExecuteStoredProcedureAsync<DeviceReturnRecord>(storedProc, parameters))?.FirstOrDefault();
                if (record == null)
                {
                    continue;
                }

                returns.Add(new DeviceReturnByDeviceModel
                {
                    DeviceSeqID = record.DeviceSeqID != 0 ? record.DeviceSeqID : deviceSeqId,
                    DeviceReturnReasonCode = record.DeviceReturnReasonCode ?? record.ReturnReasonCode,
                    DeviceReceivedDateTime = record.DeviceReceivedDateTime ?? record.ReceivedDateTime,
                    DeviceAbandonedDateTime = record.DeviceAbandonedDateTime ?? record.AbandonedDateTime,
                });
            }

            return returns;
        }

        private sealed class DeviceReturnRecord
        {
            public int DeviceSeqID { get; set; }
            public int? DeviceReturnReasonCode { get; set; }
            public int? ReturnReasonCode { get; set; }
            public DateTime? DeviceReceivedDateTime { get; set; }
            public DateTime? ReceivedDateTime { get; set; }
            public DateTime? DeviceAbandonedDateTime { get; set; }
            public DateTime? AbandonedDateTime { get; set; }
        }
    }
}
