using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IBenchTestDeviceStatusDAL
    {
        Task<IEnumerable<BenchTestBoardDeviceStatusDataModel>> GetAllDeviceStatusesByBoard(int boardId);
    }

    public class BenchTestDeviceStatusDAL : DbContext, IBenchTestDeviceStatusDAL
    {
        public BenchTestDeviceStatusDAL(
            ILogger<BenchTestDeviceStatusDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsHomebase)
        {
        }

        public async Task<IEnumerable<BenchTestBoardDeviceStatusDataModel>> GetAllDeviceStatusesByBoard(int boardId)
        {
            const string storedProc = "[dbo].[usp_XirgoBenchTestBoardDeviceStatuses_SelectByBoardID]";

            var parms = new DynamicParameters()
                .Parameter("@Parm_BoardID", boardId, dbType: DbType.Int32);

            return await ExecuteStoredProcedureAsync<BenchTestBoardDeviceStatusDataModel>(storedProc, parms);
        }
    }
}
