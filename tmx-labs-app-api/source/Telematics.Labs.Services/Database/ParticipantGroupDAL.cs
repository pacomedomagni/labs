using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IParticipantGroupDAL
    {
        /// <summary>
        /// Add a participant group to the database
        /// </summary>
        /// <returns>ParticipantGroupSeqId</returns>
        Task<int> AddParticipantGroup(ParticipantGroupDataModel model);
    }
    public class ParticipantGroupDAL : DbContext, IParticipantGroupDAL
    {
        public ParticipantGroupDAL(
            ILogger<LabsMyScoreDeviceDal> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsMyScore)
        {
        }

        public async Task<int> AddParticipantGroup(ParticipantGroupDataModel model)
        {
            var storedProc = "dbo.usp_ParticipantGroup_Insert";
            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantGroupSeqID", direction: ParameterDirection.Output, dbType: DbType.Int32)
                .Parameter("@Parm_ParticipantGroupTypeCode", value: model.ParticipantGroupType, dbType: DbType.Int16)
                .Parameter("@Parm_ParticipantGroupExternalKey", value: model.ParticipantGroupExternalKey, DbType.String);
            await ExecuteNonQueryAsync(storedProc, parms);
            return parms.Get<int>("@Parm_ParticipantGroupSeqID");
        }
    }
}
