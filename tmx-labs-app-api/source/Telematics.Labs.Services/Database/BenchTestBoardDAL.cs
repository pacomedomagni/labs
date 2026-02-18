using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IBenchTestBoardDAL
    {
        /// <summary>
        /// Get all bench test boards for a given location
        /// </summary>
        /// <param name="locationCode">Location code to filter by</param>
        /// <returns>List of bench test boards at the specified location</returns>
        Task<IEnumerable<BenchTestBoardDataModel>> GetAllBoardsByLocation(int locationCode);
    }

    public class BenchTestBoardDAL : DbContext, IBenchTestBoardDAL
    {
        public BenchTestBoardDAL(
            ILogger<BenchTestBoardDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsHomebase)
        {
        }

        public async Task<IEnumerable<BenchTestBoardDataModel>> GetAllBoardsByLocation(int locationCode)
        {
            const string storedProc = "dbo.usp_XirgoBenchTestBoard_SelectByLocation";

            var parms = new DynamicParameters()
                .Parameter("@Parm_LocationCode", locationCode, dbType: DbType.Int32);

            return await ExecuteStoredProcedureAsync<BenchTestBoardDataModel>(storedProc, parms);
        }
    }
}
