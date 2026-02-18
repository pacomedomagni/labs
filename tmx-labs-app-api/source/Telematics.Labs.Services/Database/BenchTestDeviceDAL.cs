using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IBenchTestDeviceDAL
    {
        /// <summary>
        /// Get all devices for a given board
        /// </summary>
        /// <param name="boardId"></param>
        /// <returns>List of devices for the given board</returns>
        Task<IEnumerable<BenchTestBoardDeviceDataModel>> GetAllDevicesByBoardId(int boardId);

        /// <summary>
        /// Add device to board at previously empty slot
        /// </summary>
        /// <param name="boardId">Board to update</param>
        /// <param name="device">New device</param>
        /// <returns></returns>
        Task AddDeviceToBoard(int boardId, BenchTestBoardDevice device);

        /// <summary>
        /// Update bench test board to reflect the given device
        /// </summary>
        /// <param name="boardId">Board Id to update</param>
        /// <param name="device">Device to update</param>
        /// <returns></returns>
        Task UpdateBoardDevice(int boardId, BenchTestBoardDevice device);

        /// <summary>
        /// Delete device from board at specified location
        /// </summary>
        /// <param name="boardId">Board Id</param>
        /// <param name="locationOnBoard">Location on board</param>
        /// <returns></returns>
        Task DeleteDeviceFromBoard(int boardId, int locationOnBoard);
    }

    public class BenchTestDeviceDAL : DbContext, IBenchTestDeviceDAL
    {
        public BenchTestDeviceDAL(
            ILogger<BenchTestDeviceDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsHomebase)
        {
        }

        public async Task<IEnumerable<BenchTestBoardDeviceDataModel>> GetAllDevicesByBoardId(int boardId)
        {
            const string storedProc = "dbo.usp_XirgoBenchTestBoardDevice_SelectByBoardID";

            var parms = new DynamicParameters()
                .Parameter("@Parm_BoardID", boardId, dbType: DbType.Int32);

            return await ExecuteStoredProcedureAsync<BenchTestBoardDeviceDataModel>(storedProc, parms);
        }

        public async Task AddDeviceToBoard(int boardId, BenchTestBoardDevice device)
        {
            const string storedProc = "dbo.usp_XirgoBenchTestBoardDevice_Insert";

            var parms = new DynamicParameters()
                .Parameter("@Parm_BoardID", boardId, dbType: DbType.Int32)
                .Parameter("@Parm_DeviceSerialNumber", device.DeviceSerialNumber, dbType: DbType.AnsiString, size: 50)
                .Parameter("@Parm_DeviceLocationOnBoard", device.DeviceLocationOnBoard, dbType: DbType.Int32);

            await ExecuteNonQueryAsync(storedProc, parms);
        }

        public async Task UpdateBoardDevice(int boardId, BenchTestBoardDevice device)
        {
            const string storedProc = "[dbo].[usp_XirgoBenchTestBoardDevice_UpdateByPrimaryKeyAndLocation]";

            var parms = new DynamicParameters()
                .Parameter("@Parm_BoardID", boardId, dbType: DbType.Int32)
                .Parameter("@Parm_DeviceSerialNumber", device.DeviceSerialNumber, dbType: DbType.AnsiString, size: 50)
                .Parameter("@Parm_DeviceLocationOnBoard", device.DeviceLocationOnBoard, dbType: DbType.Int32);

            await ExecuteNonQueryAsync(storedProc, parms);
        }

        public async Task DeleteDeviceFromBoard(int boardId, int locationOnBoard)
        {
            const string storedProc = "dbo.usp_XirgoBenchTestBoardDevice_DeleteByLocationAndBoardID";

            var parms = new DynamicParameters()
                .Parameter("@Parm_BoardID", boardId, dbType: DbType.Int32)
                .Parameter("@Parm_LocationOnBoard", locationOnBoard, dbType: DbType.Int32);

            await ExecuteNonQueryAsync(storedProc, parms);
        }
    }
}
