using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Configs;
using Progressive.Telematics.Labs.Shared.Utils;
using Progressive.WAM.Webguard.Client.Core.Wcf;
using Progressive.WAM.Webguard.Client.Kerberos.Core.Wcf;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.ServiceModel;
using System.ServiceModel.Description;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services
{
	internal static class ServiceExtensions
    {
        internal static string FormatServiceUrl(this string url, params object[] parms)
        {
            var options = parms.ToList();
            url = InsertEnvironmentType(url, AppServicesHelper.GetConfig<EnvironmentPrefixes>().OnPrem);
            return string.Format(url, options.ToArray());
        }

        internal static string GetUrl(this ApiConfig config, string endpoint, params object[] parms)
		{
            var url = config.BaseUrl.InsertEnvironmentType(AppServicesHelper.GetConfig<EnvironmentPrefixes>().OnPrem);
            url += config.Endpoints[endpoint];
			for (int i = 0; i < parms.Length; i++)
			{
                if(parms[i] is DateTime)
                    parms[i] = $"{parms[i]:s}";
            }
            return string.Format(url, parms);
		}

        internal static string InsertEnvironmentType(this string text, string environmentTypePrefix)
        {
            text = text.Replace("{env}", environmentTypePrefix);
            return text;
        }

        internal static async Task EnsureSuccessStatusCodeAsync(this HttpResponseMessage response, ILogger logger, params HttpStatusCode[] bypassFailureCodes)
        {
            if (response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.NotFound)
            {
                return;
            }

            var message = await response.Content.ReadAsStringAsync();

            if (response.Content != null)
                response.Content.Dispose();

            throw new TelematicsApiException(logger, message, response.StatusCode);
        }

        internal static void AddTokenEndpoint(this ServiceEndpoint endpoint, IConfiguration configuration)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                endpoint.EndpointBehaviors.Add(new KerberosJwtTokenEndpointBehavior(AppServicesHelper.GetConfig<WebguardClient>().ModernAuthorizationServiceUrl));
            }
            else
            {
                string clientSecret = Environment.GetEnvironmentVariable(configuration.GetSection("WebGuardClient").GetValue<String>("ClientSecret"));
                string clientId = Environment.GetEnvironmentVariable(configuration.GetSection("WebGuardClient").GetValue<String>("ClientId"));
                endpoint.EndpointBehaviors.Add(new JwtTokenEndpointBehavior(AppServicesHelper.GetConfig<WebguardClient>().ModernAuthorizationServiceUrl, clientId, clientSecret));
            }


        }

        internal static void AddTokenEndpoint(this ServiceEndpoint endpoint)
        {
            endpoint.EndpointBehaviors.Add(new TokenEndpointBehavior(AppServicesHelper.GetConfig<WebguardConfig>().AuthenticationServiceUrl));
        }

        internal static async Task<T> HandledCall<T, T2>(this ClientBase<T2> client, Func<Task<T>> action, ILogger logger, string message = "") where T2: class
        {
            return await HandledCall(client, action, logger, new Dictionary<ResponseStatus, string> { [ResponseStatus.Default] = message });
        }

        internal static async Task<T> HandledCall<T, T2>(this ClientBase<T2> client, Func<Task<T>> action, ILogger logger, Dictionary<ResponseStatus, string> messages) where T2 : class
        {
            logger.LogInformation("Calling {WcfEndpoint}", client.Endpoint.Address.Uri.AbsoluteUri);
            var response = await action();
            var exceptions = new List<ResponseStatus> { ResponseStatus.Failure, ResponseStatus.FailureWithWarning };
            var cast = JsonSerializer.Deserialize<WcfResponse>(JsonSerializer.Serialize(response));

            if (exceptions.Contains(cast.ResponseStatus))
            {
                var error = cast.ResponseErrors[0];
                var errorCode = error?.ErrorCode;
                var message = error?.Message;
                var ex = new Exception(message);

                messages.TryGetValue(cast.ResponseStatus, out message);

                if (string.IsNullOrEmpty(message))
                    messages.TryGetValue(ResponseStatus.Default, out message);

                if (string.IsNullOrWhiteSpace(message))
                    message = "Wcf Exception Thrown";

                logger.LogError(LoggingEvents.WcfException, ex, "{WcfErrorCode} - " + message, error.ErrorCode);

            }
            return (T)response;
        }
    }

    public static partial class JsonSerializerExtensions
    {
        public static T DeserializeAnonymousType<T>(string json, T anonymousTypeObject, JsonSerializerOptions options = default)
            => JsonSerializer.Deserialize<T>(json, options);

        public static ValueTask<TValue> DeserializeAnonymousTypeAsync<TValue>(Stream stream, TValue anonymousTypeObject, JsonSerializerOptions options = default, CancellationToken cancellationToken = default)
            => JsonSerializer.DeserializeAsync<TValue>(stream, options, cancellationToken);
    }
}









