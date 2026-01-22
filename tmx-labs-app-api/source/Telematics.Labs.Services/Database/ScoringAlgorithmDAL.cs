using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IScoringAlgorithmDAL
    {
        Task<IEnumerable<ScoringAlgorithmDataModel>> GetScoringAlgorithms();
    }
    public class ScoringAlgorithmDAL : DbContext, IScoringAlgorithmDAL
    {
        public ScoringAlgorithmDAL(
            ILogger<LabsMyScoreDeviceDal> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.Policy)
        {
        }

        public async Task<IEnumerable<ScoringAlgorithmDataModel>> GetScoringAlgorithms()
        {
            const string storedProc = "dbo.usp_ScoringAlgorithm_SelectAll";

            return await ExecuteStoredProcedureAsync<ScoringAlgorithmDataModel>(storedProc, null);
        }
    }
}
