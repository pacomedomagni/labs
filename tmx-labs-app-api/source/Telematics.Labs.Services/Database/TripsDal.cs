using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface ITripsDal
    {
        Task<IEnumerable<Trip>> GetTripsByParticipantSeqId(int participantSeqId, DateTime startDate, DateTime endDate);
    }

    public class TripsDal : DbContext, ITripsDal
    {
        public TripsDal(
            ILogger<TripsDal> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsMyScore)
        {
        }

        public async Task<IEnumerable<Trip>> GetTripsByParticipantSeqId(int participantSeqId, DateTime startDate, DateTime endDate)
        {
            const string storedProc = "dbo.usp_Trip_SelectByParticipantSeqIdAndDates";

            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantSeqID", participantSeqId, dbType: DbType.Int32)
                .Parameter("@Parm_TripStartDateTime", startDate, dbType: DbType.DateTime)
                .Parameter("@Parm_TripEndDateTime", endDate, dbType: DbType.DateTime);

            return await ExecuteStoredProcedureAsync<Trip>(storedProc, parms);

        }
    }
}
