using System.Collections.Generic;
using System.Threading.Tasks;
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
    }
}
