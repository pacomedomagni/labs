using System.Data;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IDeviceOrderDetailDAL
    {
        /// <summary>
        /// Updates a device order detail record
        /// </summary>
        /// <param name="deviceOrderDetailSeqId">Primary key of the detail record</param>
        /// <param name="deviceOrderSeqId">Optional device order sequence ID</param>
        /// <param name="participantSeqId">Optional participant sequence ID</param>
        /// <param name="vehicleSeqId">Optional vehicle sequence ID</param>
        /// <param name="deviceSeqId">Optional device sequence ID</param>
        /// <param name="isReplacementOrder">Optional replacement order flag</param>
        Task UpdateDeviceOrderDetail(
            int deviceOrderDetailSeqId,
            int? deviceOrderSeqId = null,
            int? participantSeqId = null,
            int? vehicleSeqId = null,
            int? deviceSeqId = null,
            bool? isReplacementOrder = null);
    }

    public class DeviceOrderDetailDAL : DbContext, IDeviceOrderDetailDAL
    {
        public DeviceOrderDetailDAL(
            ILogger<DeviceOrderDetailDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsMyScore)
        {
        }

        public async Task UpdateDeviceOrderDetail(
            int deviceOrderDetailSeqId,
            int? deviceOrderSeqId = null,
            int? participantSeqId = null,
            int? vehicleSeqId = null,
            int? deviceSeqId = null,
            bool? isReplacementOrder = null)
        {
            const string storedProc = "dbo.usp_DeviceOrderDetail_UpdateByPrimaryKey";

            var parms = new DynamicParameters()
                .Parameter("@Parm_DeviceOrderDetailSeqID", deviceOrderDetailSeqId, DbType.Int32)
                .Parameter("@Parm_DeviceOrderSeqID", deviceOrderSeqId, DbType.Int32)
                .Parameter("@Parm_ParticipantSeqID", participantSeqId, DbType.Int32)
                .Parameter("@Parm_VehicleSeqID", vehicleSeqId, DbType.Int32)
                .Parameter("@Parm_DeviceSeqID", deviceSeqId, DbType.Int32)
                .Parameter("@Parm_IsReplacementOrder", isReplacementOrder, DbType.Boolean);

            await ExecuteNonQueryAsync(storedProc, parms);
        }
    }
}
