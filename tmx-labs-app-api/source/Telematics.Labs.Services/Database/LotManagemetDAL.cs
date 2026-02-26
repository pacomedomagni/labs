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
    public interface ILotManagementDAL
    {
        Task<IEnumerable<DeviceLotDataModel>> GetLotsForMarkBenchTestComplete();
        Task UpdateLot(int lotSeqId, string name, int? statusCode, int? typeCode);
    }

    public class LotManagementDAL : DbContext, ILotManagementDAL
    {
        public LotManagementDAL(
            ILogger<LotManagementDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsHomebase)
        {
        }

        public async Task<IEnumerable<DeviceLotDataModel>> GetLotsForMarkBenchTestComplete()
        {
            const string storedProc = "dbo.usp_XirgoLot_SelectLotsForMarkBenchTestComplete";

            return await ExecuteStoredProcedureAsync<DeviceLotDataModel>(storedProc, null);
        }

        public async Task UpdateLot(int lotSeqId, string name, int? statusCode, int? typeCode)
        {
            const string storedProc = "[dbo].[usp_XirgoLot_UpdateByPrimaryKey]";

            var parms = new DynamicParameters()
                .Parameter("@Parm_LotSeqID", lotSeqId, dbType: DbType.Int32)
                .Parameter("@Parm_Name", name, dbType: DbType.String)
                .Parameter("@Parm_StatusCode", statusCode, dbType: DbType.Int16)
                .Parameter("@Parm_TypeCode", typeCode, dbType: DbType.Int16);

            await ExecuteNonQueryAsync(storedProc, parms);
        }
    }
}
