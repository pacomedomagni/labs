using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Admin.Services.Models.UbiDTO;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Shared.Configs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Services.Database
{

	[SingletonService]
	public interface ITripDetailsDAL
	{
		Task<GetTDByTripSeqIDResponse> GetTripDetails(long tripSeqId, DateTime start, int page, int pageSize, string filter);
	}

	public class TripDetailsDAL : DbContext, ITripDetailsDAL
	{
		private readonly IHttpContextAccessor contextAccessor;
		private readonly IOptions<TranactionAlerts> transactionAlerts;

		public TripDetailsDAL(
			ILogger<TripDetailsDAL> logger,
			IOptions<ConnectionStringsConfig> config,
			IOptions<TranactionAlerts> transConfig,
			IOptions<EnvironmentPrefixes> envConfig,
			IHttpContextAccessor contextAccessor
		)
			: base(logger, envConfig.Value.SQL, config.Value.TripDetail)
		{
			this.contextAccessor = contextAccessor;
			this.transactionAlerts = transConfig;
		}

		public async Task<GetTDByTripSeqIDResponse> GetTripDetails(long tripSeqId, DateTime start, int page, int pageSize, string filter)
		{
			var storedProc = "usp_TripDetail_PH_Select";
			var parms = new DynamicParameters()
				.Parameter("@Parm_TripSeqID", tripSeqId)
				.Parameter("@Parm_TripStart", start)
				.Parameter("@Parm_EventDescription", string.IsNullOrEmpty(filter) ? null: filter)
				.Parameter("@Parm_Page", page + 1)
				.Parameter("@Parm_PageSize",pageSize);

			try
			{
				var data = await ExecuteDataFillAsync($"dbo.{storedProc}", parms);
				var tripDetails = new List<TripEventDTO>();
				DataTable speeds = data[0];
				var speedReader = speeds.CreateDataReader();
				while (speedReader.Read())
				{
					var row = new TripEventDTO
					{
						EventDateTime = speedReader.GetDateTime(0),
						Speed = speedReader.GetByte(1),
						EventDescription = speedReader.IsDBNull(2) ? "" : speedReader.GetString(2)
					};
					tripDetails.Add(row);
				}

				return new GetTDByTripSeqIDResponse
				{
					TripEventList = tripDetails,
					TotalRecordCount = data[1].Rows[0].Field<int>(0)
				};
			}
			catch (Exception ex)
			{
				logger.LogError(ex.Message);
				return null;
			}
		}
	}
}
