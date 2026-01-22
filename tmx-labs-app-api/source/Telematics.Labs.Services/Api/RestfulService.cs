using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Configs;
using Progressive.WAM.Webguard.Client.Core;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Api
{
	public abstract class RestfulApi
	{
		HttpClient _client;
		protected ILogger Logger { get; private set; }
		protected ApiConfig Config { get; private set; }
		private IHttpContextAccessor HttpContextAccessor { get; set; }
		protected string CurrentUser
		{
			get
			{
				return HttpContextAccessor.CurrentUser();
			}
		}


		public RestfulApi(ILogger logger, ApiConfig config, IOptions<WebguardConfig> webGuard, IHttpContextAccessor contextAccessor)
		{
			Logger = logger;
			Config = config;
			HttpContextAccessor = contextAccessor;
			_client = new HttpClient(new AuthorizationHandler(webGuard.Value.AuthenticationServiceUrl));
		}

		protected async Task<T> Get<T>(string url)
		{
			var response = await _client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
			return await parseResponse<T>(response);
		}

		protected async Task<HttpResponseMessage> Get(string url)
		{
			var response = await _client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
			return response;
		}

		protected async Task<T> Post<T>(string url, object body)
		{
			//PostAsJsonAsync doesn't work as it sends data as chunked request which apparently the existing service doesn't accept
			//https://github.com/aspnet/AspNetWebStack/issues/252
			//var response = await _client.PostAsJsonAsync(url, body);

			var response = await _client.PostAsync(url,
				new StringContent(JsonSerializer.Serialize(body))
				{ Headers = { ContentType = new MediaTypeHeaderValue("application/json") } });
			return await parseResponse<T>(response);
		}

		protected async Task<T> Put<T>(string url, object body)
		{
			var response = await _client.PutAsync(url,
				new StringContent(JsonSerializer.Serialize(body))
				{ Headers = { ContentType = new MediaTypeHeaderValue("application/json") } });
			return await parseResponse<T>(response);
		}

		protected async Task<T> Patch<T>(string url, object body)
		{
			var response = await _client.PatchAsync(url,
				new StringContent(JsonSerializer.Serialize(body))
				{ Headers = { ContentType = new MediaTypeHeaderValue("application/json") } });
			return await parseResponse<T>(response);
		}

		protected async Task<T> Delete<T>(string url)
		{
			var response = await _client.DeleteAsync(url);
			return parseResponse<T>(response).Result;
		}

		async Task<T> parseResponse<T>(HttpResponseMessage response)
		{
			try
			{
				await response.EnsureSuccessStatusCodeAsync(Logger);
				return await readResponse<T>(response);
			}
			catch (TelematicsApiException ex)
			{
				var model = !string.IsNullOrEmpty(ex.Message) ? 
					JsonSerializer.Deserialize<TelematicsApiExceptionModel>(ex.Message, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) :
					new TelematicsApiExceptionModel(); 

				if (!string.IsNullOrWhiteSpace(model.Message) || !string.IsNullOrWhiteSpace(model.DeveloperMessage))
					ex = new TelematicsApiException(Logger, !string.IsNullOrWhiteSpace(model.Message) ? model.Message : model.DeveloperMessage, ex.StatusCode);

				ex.DeveloperMessage = model.DeveloperMessage;
				ex.ErrorCode = model.ErrorCode;
				
				throw (ex);
			}
		}

		async Task<T> readResponse<T>(HttpResponseMessage response)
		{
			if (response.Content is object &&
					response.Content.Headers.ContentType?.MediaType == "application/json")
			{
				var contentStream = await response.Content.ReadAsStreamAsync();

				try
				{
					return await JsonSerializer.DeserializeAsync<T>(contentStream,
						new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
				}
				catch (JsonException jsonEx)
				{
					throw jsonEx;
				}
			}

			return default(T);
		}
	}
}
