using Azure;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface ICustomerInfoDAL 
    {
        Task<ParticipantGroup> GetParticipantGroup(int participantGroupSeqId);
        Task<ParticipantGroup> GetParticipantGroupByExternalKey(string participantGroupExternalKey);
        Task<DataTable> GetCustsByDevSearch(int deviceId);
        Task UpdateParticipantGroup(ParticipantGroup participantGroup);
    }  

public class CustomerInfoDAL : DbContext, ICustomerInfoDAL
    {
        private readonly IHttpContextAccessor _contextAccessor;

        public CustomerInfoDAL(
            ILogger<CustomerInfoDAL> logger,
            IOptions<ConnectionStringsConfig> config,
            IOptions<EnvironmentPrefixes> envConfig,
            IHttpContextAccessor contextAccessor)
            : base(logger, envConfig.Value.SQL, config.Value.LabsMyScore)
        {
            _contextAccessor = contextAccessor;
        }

        public async Task<DataTable> GetCustsByDevSearch(int deviceId)
        {
            var storedProc = "dbo.usp_Participant_ParticipantGroup_SelectByDeviceSeqId";
            var parms = new DynamicParameters()
                .Parameter("@Parm_DeviceSeqID", deviceId);
            var result = await ExecuteDataFillAsync(storedProc, parms);
            return result[0];
        }

        public async Task<ParticipantGroup> GetParticipantGroup(int participantGroupSeqId)
        {
            var storedProc = "dbo.usp_ParticipantGroup_SelectByPrimaryKey";
            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantGroupSeqID", participantGroupSeqId);
            var data = await ExecuteStoredProcedureAsync<ParticipantGroup>(storedProc, parms);
            return data.FirstOrDefault<ParticipantGroup>();
        }

        public async Task<ParticipantGroup> GetParticipantGroupByExternalKey(string participantGroupExternalKey)
        {

            var storedProc = "dbo.usp_ParticipantGroup_SelectByExternalKey";
            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantGroupExternalKey", participantGroupExternalKey);
            var data = await ExecuteStoredProcedureAsync<ParticipantGroup>(storedProc, parms);
            return data.FirstOrDefault<ParticipantGroup>();
        }

        public async Task UpdateParticipantGroup(ParticipantGroup participantGroup)
        {
            var storedProc = "dbo.usp_ParticipantGroup_UpdateByPrimaryKey";
            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantGroupSeqID", participantGroup.ParticipantGroupSeqID)
                .Parameter("@Parm_ParticipantGroupExternalKey", participantGroup.ParticipantGroupExternalKey)
                .Parameter("@Parm_ParticipantGroupTypeCode", participantGroup.ParticipantGroupTypeCode);

            await ExecuteStoredProcedureAsync<bool>(storedProc, parms);
        }
    }
}
