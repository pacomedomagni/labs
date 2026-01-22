using System.Collections.Generic;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface ITripEventsDAL
    {
        Task<IEnumerable<TripEvent>> GetTripEventsByTripSeqId(int tripSeqId);
    }

    public class TripEventsDAL : DbContext, ITripEventsDAL
    {
        private readonly IHttpContextAccessor _contextAccessor;

        public TripEventsDAL(
            ILogger<TripEventsDAL> logger,
            IOptions<ConnectionStringsConfig> config,
            IOptions<EnvironmentPrefixes> envConfig,
            IHttpContextAccessor contextAccessor)
            : base(logger, envConfig.Value.SQL, config.Value.LabsMyScore)
        {
            _contextAccessor = contextAccessor;
        }

        public async Task<IEnumerable<TripEvent>> GetTripEventsByTripSeqId(int tripSeqId)
        {
            const string storedProc = "[dbo].[usp_TripEvent_SelectAllByTripSeqID]";
            var parms = new DynamicParameters()
                .Parameter("@Parm_TripSeqID", tripSeqId, DbType.Int64);

            var detail = await ExecuteStoredProcedureAsync<TripEvent>(storedProc, parms);

            if (detail == null) return [];

            return detail;
        }
    }
}
