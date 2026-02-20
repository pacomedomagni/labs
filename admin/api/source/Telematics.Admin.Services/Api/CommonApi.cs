using System;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Shared.Configs;

namespace Progressive.Telematics.Admin.Services.Api
{
	public interface ICommonApi
	{
		Task<OData<CompatibilityType>> GetCompatibilityTypes();
		Task<OData<CompatibilityAction>> GetCompatibilityActions();
		Task<OData<CompatibilityItem>> GetCompatibilityItems(int participantSeqId);
		Task<bool> UpdateCompatibilityItem(CompatibilityItem compatibilityItem);
		Task<bool> AddCompatibilityItem(CompatibilityItem compatibilityItem);
	}

	public class CommonApi : ModernApiBase<CommonApi>, ICommonApi
	{
		private readonly IHttpContextAccessor contextAccessor;

		public CommonApi(ILogger<CommonApi> logger, IHttpClientFactory clientFactory, IOptions<ServicesConfig> options, IOptions<EnvironmentPrefixes> envConfig, IHttpContextAccessor contextAccessor)
			: base(logger, clientFactory, options.Value.CommonApi)
		{
			var configUrl = config.BaseUrl.InsertEnvironmentType(envConfig.Value.OnPrem);
			this.client.BaseAddress = new Uri(configUrl);
			this.contextAccessor = contextAccessor;
		}

		public async Task<OData<CompatibilityType>> GetCompatibilityTypes()
		{
			var endpoint = string.Format(config.Endpoints["CompatibilityTypes"]);
			return await NotFoundNullResponseHandler<OData<CompatibilityType>>(
				endpoint,
				() => client.GetAsync(endpoint),
				() => $"No compatibility type data returned by {nameof(CommonApi)}",
				(response) => $"({response.StatusCode}) Failure getting compatibility type data from {nameof(CommonApi)}",
				JsonSerializerSettings.CaseInsensitive);
		}

		public async Task<OData<CompatibilityAction>> GetCompatibilityActions()
		{
			var endpoint = string.Format(config.Endpoints["CompatibilityActions"]);
			return await NotFoundNullResponseHandler<OData<CompatibilityAction>>(
				endpoint,
				() => client.GetAsync(endpoint),
				() => $"No compatibility action data returned by {nameof(CommonApi)}",
				(response) => $"({response.StatusCode}) Failure getting compatibility action data from {nameof(CommonApi)}",
				JsonSerializerSettings.CaseInsensitive);
		}

		public async Task<OData<CompatibilityItem>> GetCompatibilityItems(int participantSeqId)
		{
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.ParticipantSeqId, participantSeqId));

			var endpoint = string.Format(config.Endpoints["CompatibilityByParticipantSeqId"], participantSeqId);
			return await NotFoundNullResponseHandler<OData<CompatibilityItem>>(
				endpoint,
				() => client.GetAsync(endpoint),
				() => $"No compatibility item data returned by {nameof(CommonApi)}",
				(response) => $"({response.StatusCode}) Failure getting compatibility item data from {nameof(CommonApi)}",
				JsonSerializerSettings.CaseInsensitive);

		}

		public async Task<bool> UpdateCompatibilityItem(CompatibilityItem compatibilityItem)
		{
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.CompatibilitySeqId, compatibilityItem.CompatibilitySeqId));

			compatibilityItem.LastChangeUserId = contextAccessor.CurrentUser();
			compatibilityItem.LastChangeDateTime = DateTime.Now.Truncate(TimeSpan.TicksPerSecond);

			var data = compatibilityItem.AsDictionary();
			data.Remove("CompatibilityActionTakenXRef");
			data.Add("CompatibilityActionTakenCodes", compatibilityItem.CompatibilityActionTakenXRef.Select(x => x.ActionTakenCode));

			var endpoint = string.Format(config.Endpoints["CompatibilityUpdate"], compatibilityItem.CompatibilitySeqId);
			var result = await TrueFalseResponseHandler(
				endpoint,
				() => client.PutAsync(endpoint, SerializeModelForRequest(data, JsonSerializerSettings.EnumsAsNumbers)),
				(response) => $"({response.StatusCode}) Failure updating compatibility data from {nameof(CommonApi)}");

			return result;
		}

		public async Task<bool> AddCompatibilityItem(CompatibilityItem compatibilityItem)
		{
			using var loggingScope = logger.BeginPropertyScope((LoggingConstants.CompatibilitySeqId, compatibilityItem.CompatibilitySeqId));

			compatibilityItem.LastChangeUserId = contextAccessor.CurrentUser();
			compatibilityItem.LastChangeDateTime = DateTime.Now.Truncate(TimeSpan.TicksPerSecond);

			var data = compatibilityItem.AsDictionary();
			data.Remove("CompatibilityActionTakenXRef");
			data.Add("CompatibilityActionTakenCodes", compatibilityItem.CompatibilityActionTakenXRef.Select(x => x.ActionTakenCode));

			var endpoint = string.Format(config.Endpoints["CompatibilityAdd"]);
			var result = await TrueFalseResponseHandler(
				endpoint,
				() => client.PostAsync(endpoint, SerializeModelForRequest(data, JsonSerializerSettings.EnumsAsNumbers)),
				(response) => $"({response.StatusCode}) Failure adding compatibility data from {nameof(CommonApi)}");

			return result;
		}
	}
}
