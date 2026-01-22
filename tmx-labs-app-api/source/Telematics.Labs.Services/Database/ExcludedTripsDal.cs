using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface IExcludedTripsDal
    {
        Task<IEnumerable<ExcludedDateRange>> GetExcludedTripsByParticipantSeqId(int participantSeqId);
        Task<ExcludedDateRange?> InsertExcludedTripAsync(int participantSeqId, DateTime rangeStart, DateTime rangeEnd, string? description);
        Task<ExcludedDateRange?> UpdateExcludedTripAsync(int participantSeqId, DateTime rangeStart, DateTime rangeEnd, string? description, DateTime? originalRangeStart = null);
        Task DeleteExcludedTripAsync(int participantSeqId, DateTime rangeStart);
    }

    public class ExcludedTripsDal : DbContext, IExcludedTripsDal
    {
        public ExcludedTripsDal(
            ILogger<ExcludedTripsDal> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsMyScore)
        {
        }

        public async Task<IEnumerable<ExcludedDateRange>> GetExcludedTripsByParticipantSeqId(int participantSeqId)
        {
            const string storedProc = "dbo.usp_ExcludedDateRange_SelectByParticipant";

            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantSeqID", participantSeqId, dbType: DbType.Int32);

            return await ExecuteStoredProcedureAsync<ExcludedDateRange>(storedProc, parms);
        }

        public async Task<ExcludedDateRange?> InsertExcludedTripAsync(int participantSeqId, DateTime rangeStart, DateTime rangeEnd, string? description)
        {
            const string storedProc = "dbo.usp_ExcludedDateRange_Insert";

            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantSeqID", participantSeqId, dbType: DbType.Int32)
                .Parameter("@Parm_RangeStart", rangeStart, dbType: DbType.DateTime2)
                .Parameter("@Parm_RangeEnd", rangeEnd, dbType: DbType.DateTime2)
                .Parameter("@Parm_Description", description, dbType: DbType.String);

            await ExecuteNonQueryAsync(storedProc, parms);

            return await GetExcludedTripAsync(participantSeqId, rangeStart);
        }

        public async Task<ExcludedDateRange?> UpdateExcludedTripAsync(int participantSeqId, DateTime rangeStart, DateTime rangeEnd, string? description, DateTime? originalRangeStart = null)
        {
            const string storedProc = "dbo.usp_ExcludedDateRange_UpdateByPrimaryKey";

            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantSeqID", participantSeqId, dbType: DbType.Int32)
                .Parameter("@Parm_RangeStart", originalRangeStart ?? rangeStart, dbType: DbType.DateTime2)
                .Parameter("@Parm_RangeEnd", rangeEnd, dbType: DbType.DateTime2)
                .Parameter("@Parm_Description", description, dbType: DbType.String);

            await ExecuteNonQueryAsync(storedProc, parms);

            var lookupStart = originalRangeStart ?? rangeStart;
            return await GetExcludedTripAsync(participantSeqId, lookupStart);
        }

        public async Task DeleteExcludedTripAsync(int participantSeqId, DateTime rangeStart)
        {
            const string storedProc = "dbo.usp_ExcludedDateRange_DeleteByPrimaryKey";

            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantSeqID", participantSeqId, dbType: DbType.Int32)
                .Parameter("@Parm_RangeStart", rangeStart, dbType: DbType.DateTime2);

            await ExecuteNonQueryAsync(storedProc, parms);
        }

        private async Task<ExcludedDateRange?> GetExcludedTripAsync(int participantSeqId, DateTime rangeStart)
        {
            const string storedProc = "dbo.usp_ExcludedDateRange_SelectByPrimaryKey";

            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantSeqID", participantSeqId, dbType: DbType.Int32)
                .Parameter("@Parm_RangeStart", rangeStart, dbType: DbType.DateTime2);

            var result = await ExecuteStoredProcedureAsync<ExcludedDateRange>(storedProc, parms);
            return result.FirstOrDefault();
        }
    }
}
