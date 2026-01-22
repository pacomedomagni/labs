using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Configs;

namespace Progressive.Telematics.Labs.Services.Api
{
	public abstract class ApiBase<T>
	{
		protected readonly ILogger<T> logger;
		protected readonly IHttpClientFactory clientFactory;
		protected readonly HttpClient client;
		protected readonly ApiConfig config;

		public ApiBase(ILogger<T> logger, IHttpClientFactory clientFactory, ApiConfig config)
		{
			this.logger = logger;
			this.clientFactory = clientFactory;
			this.client = clientFactory.CreateClient("LegacyToken");
			this.config = config;
		}

		protected StringContent SerializeModelForRequest<T1>(T1 model, JsonSerializerOptions serializerSettings = null) where T1 : class
		{
			var content = JsonSerializer.Serialize(model, serializerSettings ?? JsonSerializerSettings.DefaultOptions);
			return new StringContent(content, Encoding.UTF8, "application/json");
		}

		protected async Task<bool> TrueFalseResponseHandler(string endpoint, Func<Task<HttpResponseMessage>> clientCall, Func<HttpResponseMessage, string> errorMessage)
		{
			var response = await SuccessFailureResponseHandler(endpoint, clientCall, errorMessage);
			return response.IsSuccessStatusCode;
		}

		protected async Task<HttpResponseMessage> SuccessFailureResponseHandler(string endpoint, Func<Task<HttpResponseMessage>> clientCall, Func<HttpResponseMessage, string> errorMessage)
		{
			logger.LogInformation("Calling {ApiEndpoint}", client.BaseAddress.AbsoluteUri + endpoint);
			var response = await clientCall();

			if (!response.IsSuccessStatusCode)
			{
				logger.LogError(LoggingEvents.UnexpectedApiResponse, errorMessage(response));
			}

			return response;
		}

		protected async Task<T1> SuccessFailureResponseHandler<T1>(string endpoint, Func<Task<HttpResponseMessage>> clientCall, Func<HttpResponseMessage, string> errorMessage, JsonSerializerOptions serializerSettings = null) where T1 : class
		{
			logger.LogInformation("Calling {ApiEndpoint}", client.BaseAddress.AbsoluteUri + endpoint);
			var response = await clientCall();
			using var content = response.Content;

			if (response.IsSuccessStatusCode)
			{
				return JsonSerializer.Deserialize<T1>(await content.ReadAsStringAsync(), serializerSettings ?? JsonSerializerSettings.DefaultOptions);
			}
			else
			{
				logger.LogError(LoggingEvents.UnexpectedApiResponse, errorMessage(response));
				return null;
			}
		}

		protected async Task<HttpResponseMessage> NotFoundNullResponseHandler(string endpoint, Func<Task<HttpResponseMessage>> clientCall, Func<string> notFoundMessage, Func<HttpResponseMessage, string> errorMessage)
		{
			logger.LogInformation("Calling {ApiEndpoint}", client.BaseAddress.AbsoluteUri + endpoint);
			var response = await clientCall();

			if (response.StatusCode == HttpStatusCode.NotFound)
			{
				logger.LogWarning(notFoundMessage());
			}
			else
			{
				logger.LogError(LoggingEvents.UnexpectedApiResponse, errorMessage(response));
			}

			return response;
		}

		protected async Task<T1> NotFoundNullResponseHandler<T1>(string endpoint, Func<Task<HttpResponseMessage>> clientCall, Func<string> notFoundMessage, Func<HttpResponseMessage, string> errorMessage, JsonSerializerOptions serializerSettings = null) where T1 : class
		{
			logger.LogInformation("Calling {ApiEndpoint}", client.BaseAddress.AbsoluteUri + endpoint);
			var response = await clientCall();
			using var content = response.Content;

			if (response.IsSuccessStatusCode)
			{
				return JsonSerializer.Deserialize<T1>(await content.ReadAsStringAsync(), serializerSettings ?? JsonSerializerSettings.DefaultOptions);
			}
			else if (response.StatusCode == HttpStatusCode.NotFound)
			{
				logger.LogWarning(notFoundMessage());
				return null;
			}
			else
			{
				logger.LogError(LoggingEvents.UnexpectedApiResponse, errorMessage(response));
				return null;
			}
		}

		protected async Task<dynamic> UnwrapTelematicsExceptionMessage(HttpResponseMessage response)
		{
			try
			{
				return JsonSerializerExtensions.DeserializeAnonymousType(await response.Content.ReadAsStringAsync(), new { Message = "", DeveloperMessage = "", ErrorCode = "" }, JsonSerializerSettings.CaseInsensitive);
			}
			catch 
			{
				return null;
			}
		}
	}
}

