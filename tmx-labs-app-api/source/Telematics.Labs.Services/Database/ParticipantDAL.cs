using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Vehicle;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IParticipantDAL
    {
        /// <returns>DeviceOrderSeqId of the new participant</returns>
        Task<int> AddParticipant(AddAccountParticipantRequest request);
        
        /// <returns>Updated vehicle</returns>
        Task<Vehicle> UpdateVehicle(Vehicle vehicle);
        
        /// <returns>True if vehicle was deleted successfully</returns>
        Task<bool> UpdateVehicleStatus(int participantSeqId, bool isActive);
        
        Task<ParticipantInfo> GetParticipantBySeqId(int participantSeqId);
        Task UpdateParticipantNickname(int participantSeqId, string nickname);
        Task UpdateParticipantStatus(int participantSeqId, int participantStatusCode);
        Task CancelPendingDeviceOrders(int participantSeqId, DeviceOrderStatus currentStatus, DeviceOrderStatus cancelledStatus);
        Task SwapParticipantAssignments(
            int sourceParticipantSeqId,
            int destinationParticipantSeqId,
            int sourceDeviceSeqId,
            int destinationDeviceSeqId,
            int sourceVehicleSeqId,
            int destinationVehicleSeqId,
            string? sourceNickname,
            string? destinationNickname);
    }

    public class ParticipantDAL(
        ILogger<CustomerInfoDAL> logger,
        IOptions<ConnectionStringsConfig> config,
        IOptions<EnvironmentPrefixes> envConfig,
        IHttpContextAccessor contextAccessor) : DbContext(logger, envConfig.Value.SQL, config.Value.LabsMyScore),
        IParticipantDAL
    {
        public async Task<int> AddParticipant(AddAccountParticipantRequest request)
        {
            var storedProc = "dbo.usp_Account_AddParticipants";

            var parameters = new DynamicParameters();
            parameters.Add("@Parm_ParticipantGroupSeqID", request.ParticipantGroupSeqId, DbType.Int32);
            parameters.Add("@Parm_DeviceOrderSeqID", dbType: DbType.Int32, direction: ParameterDirection.Output);
            parameters.Add("@Parm_VehicleTable",
                CreateVehiclesDataTable(request.DriverVehicleInformation)
                    .AsTableValuedParameter("[dbo].[VehicleTableType]"));
            await ExecuteNonQueryAsync("dbo.usp_Account_AddParticipants", parameters);

            return parameters.Get<int>("@Parm_DeviceOrderSeqID");
        }

        public async Task<Vehicle> UpdateVehicle(Vehicle vehicle)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@Parm_VehicleSeqID", vehicle.VehicleSeqID, DbType.Int32);
            parameters.Add("@Parm_VIN", vehicle.VIN, DbType.String);
            parameters.Add("@Parm_Year", vehicle.Year, DbType.Int16);
            parameters.Add("@Parm_Make", vehicle.Make, DbType.String);
            parameters.Add("@Parm_Model", vehicle.Model, DbType.String);
            parameters.Add("@Parm_VehicleExternalId", vehicle.VehicleExternalId, DbType.String);

            var result = await ExecuteDataFillAsync("dbo.usp_Vehicle_UpdateByPrimaryKey", parameters);
            
            if (result != null && result.Count > 0)
            {
                return vehicle;
            }

            return null;
        }

        public async Task<bool> UpdateVehicleStatus(int participantSeqId, bool isActive)
        {
            const string storedProc = "dbo.usp_Participant_UpdateIsActiveByPrimaryKey";

            var parameters = new DynamicParameters();
            parameters.Add("@Parm_ParticipantSeqID", participantSeqId, DbType.Int32);
            parameters.Add("@Parm_IsActive", isActive, DbType.Boolean);

            var result = await ExecuteStoredProcedureAsync<bool>(storedProc, parameters);

            return result.FirstOrDefault();
        }

        public async Task<ParticipantInfo> GetParticipantBySeqId(int participantSeqId)
        {
            const string storedProc = "dbo.usp_Participant_SelectByPrimaryKey";

            var parameters = new DynamicParameters();
            parameters.Add("@Parm_ParticipantSeqID", participantSeqId, DbType.Int32);

            var tables = await ExecuteDataFillAsync(storedProc, parameters);
            var table = tables?.FirstOrDefault();
            var row = table?.Rows.Cast<DataRow>().FirstOrDefault();

            return row == null ? null : new ParticipantInfo(row);
        }

        public Task UpdateParticipantNickname(int participantSeqId, string nickname)
        {
            const string storedProc = "dbo.usp_Participant_UpdateByPrimaryKey";

            var parameters = new DynamicParameters();
            parameters.Add("@Parm_ParticipantSeqID", participantSeqId, DbType.Int32);
            parameters.Add("@Parm_Nickname", string.IsNullOrWhiteSpace(nickname) ? null : nickname.Trim(), DbType.String);

            return ExecuteStoredProcedureAsync<bool>(storedProc, parameters);
        }

        public Task UpdateParticipantStatus(int participantSeqId, int participantStatusCode)
        {
            const string storedProc = "dbo.usp_Participant_UpdateByPrimaryKey";

            var parameters = new DynamicParameters();
            parameters.Add("@Parm_ParticipantSeqID", participantSeqId, DbType.Int32);
            parameters.Add("@Parm_ParticipantStatusCode", participantStatusCode, DbType.Int32);

            return ExecuteStoredProcedureAsync<int>(storedProc, parameters);
        }

        public Task CancelPendingDeviceOrders(int participantSeqId, DeviceOrderStatus currentStatus, DeviceOrderStatus cancelledStatus)
        {
            const string storedProc = "dbo.usp_DeviceOrder_CancelPendingByParticipant";

            var parameters = new DynamicParameters();
            parameters.Add("@Parm_ParticipantSeqID", participantSeqId, DbType.Int32);
            parameters.Add("@Parm_CurrentDeviceOrderStatusCode", (int)currentStatus, DbType.Int32);
            parameters.Add("@Parm_CancelledDeviceOrderStatusCode", (int)cancelledStatus, DbType.Int32);

            return ExecuteStoredProcedureAsync<int>(storedProc, parameters);
        }

        public async Task SwapParticipantAssignments(
            int sourceParticipantSeqId,
            int destinationParticipantSeqId,
            int sourceDeviceSeqId,
            int destinationDeviceSeqId,
            int sourceVehicleSeqId,
            int destinationVehicleSeqId,
            string? sourceNickname,
            string? destinationNickname)
        {
            const string storedProc = "dbo.usp_Participant_SwapAssignments";

            var parameters = new DynamicParameters();
            parameters.Add("@SourceParticipantSeqID", sourceParticipantSeqId, DbType.Int32);
            parameters.Add("@DestinationParticipantSeqID", destinationParticipantSeqId, DbType.Int32);
            parameters.Add("@SourceDeviceSeqID", sourceDeviceSeqId, DbType.Int32);
            parameters.Add("@DestinationDeviceSeqID", destinationDeviceSeqId, DbType.Int32);
            parameters.Add("@SourceVehicleSeqID", sourceVehicleSeqId, DbType.Int32);
            parameters.Add("@DestinationVehicleSeqID", destinationVehicleSeqId, DbType.Int32);
            parameters.Add("@SourceNickname", string.IsNullOrWhiteSpace(sourceNickname) ? null : sourceNickname.Trim(), DbType.String);
            parameters.Add("@DestinationNickname", string.IsNullOrWhiteSpace(destinationNickname) ? null : destinationNickname.Trim(), DbType.String);

            await ExecuteStoredProcedureAsync<int>(storedProc, parameters);
        }

        private static DataTable CreateVehiclesDataTable(VehicleInformation vehicle)
        {
            DataTable vehiclesDataTable = new DataTable("VehiclesTable");
            vehiclesDataTable.Columns.Add("VIN", typeof(String));
            vehiclesDataTable.Columns.Add("Year", typeof(Int32));
            vehiclesDataTable.Columns.Add("Make", typeof(String));
            vehiclesDataTable.Columns.Add("Model", typeof(String));
            vehiclesDataTable.Columns.Add("ScoringAlgorithmCode", typeof(Int32));

            DataRow dr = vehiclesDataTable.NewRow();
            dr[0] = vehicle.Vehicle.VIN ?? "";
            dr[1] = vehicle.Vehicle.Year;
            dr[2] = vehicle.Vehicle.Make;
            dr[3] = vehicle.Vehicle.Model;
            dr[4] = vehicle.ScoringAlgorithmCode;
            vehiclesDataTable.Rows.Add(dr);
            
            return vehiclesDataTable;
        }
    }
}
