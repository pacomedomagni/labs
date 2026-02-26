using System.Data;
using System.Linq;
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
    public interface IConfigValuesDAL
    {
        Task<ConfigValueDataModel> GetConfigValueByKey(string configValueKey);
    }

    public class ConfigValuesDAL : DbContext, IConfigValuesDAL
    {
        public ConfigValuesDAL(
            ILogger<ConfigValuesDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsHomebase)
        {
        }

        public async Task<ConfigValueDataModel> GetConfigValueByKey(string configValueKey)
        {
            const string storedProc = "[dbo].[usp_ConfigValues_SelectByPrimaryKey]";

            var parms = new DynamicParameters()
                .Parameter("@Parm_ConfigValueKey", configValueKey, dbType: DbType.AnsiString, size: 50);

            var result = await ExecuteStoredProcedureAsync<ConfigValueDataModel>(storedProc, parms);
            
            return result.FirstOrDefault();
        }
    }
}
