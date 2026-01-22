using System.Collections.Generic;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface ITripDetailsGPSDAL
    {
        Task<IEnumerable<TripDetailsGPS>> GetTripDetailsGPSByTripSeqId(int tripSeqId);
    }

    public class TripDetailsGPSDAL : DbContext, ITripDetailsGPSDAL
    {
        private readonly IHttpContextAccessor _contextAccessor;

        public TripDetailsGPSDAL(
            ILogger<TripDetailsGPSDAL> logger,
            IOptions<ConnectionStringsConfig> config,
            IOptions<EnvironmentPrefixes> envConfig,
            IHttpContextAccessor contextAccessor)
            : base(logger, envConfig.Value.SQL, config.Value.LabsTripDetails)
        {
            _contextAccessor = contextAccessor;
        }

        public async Task<IEnumerable<TripDetailsGPS>> GetTripDetailsGPSByTripSeqId(int tripSeqId)
        {
            // tripSeqId = 10000;

            var storedProc = "dbo.usp_TripDetailGPS_SelectByTripSeqID";
            var parms = new DynamicParameters()
                .Parameter("@Parm_TripSeqID", tripSeqId, DbType.Int64);

            var detail = await ExecuteStoredProcedureAsync<TripDetailsGPS>(storedProc, parms);

            if (detail == null) return new List<TripDetailsGPS>();

            return detail;
        }
    }
}
