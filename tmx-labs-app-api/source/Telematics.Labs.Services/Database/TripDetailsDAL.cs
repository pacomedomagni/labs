using Azure.Core;
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
    public interface ITripDetailsDal
    {
        Task<TripDetailsResponse> GetTripDetails(long tripSeqId, TripSpeedDistanceUnit unit);
    }

    public class TripDetailsDal : DbContext, ITripDetailsDal
    {
        public TripDetailsDal(
            ILogger<TripsDal> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.TripDetail)
        {
        }

        public async Task<TripDetailsResponse> GetTripDetails(long tripSeqId, TripSpeedDistanceUnit unit)
        {
            const string storedProc = "dbo.usp_TripDetail_SelectByTripSeqID";

            var parameters = new DynamicParameters();
            parameters.Add("@Parm_TripSeqID", tripSeqId, DbType.Int64);

            var result = await ExecuteDataFillAsync(storedProc, parameters);
           
            TripDetailsResponse response = new TripDetailsResponse();
            var tempList = new List<TripDetail>();
            var dataTable = result.FirstOrDefault();

            foreach (DataRow row in dataTable.Rows)
            {
                var detail = new TripDetail(row, unit);
                tempList.Add(detail);
            }

            response.SetDetails(tempList.ToArray());
            response.RecordCount = tempList.Count;
            response.SpeedDistanceUnit = unit;

            return response;
        }
    }
}
