using Microsoft.Extensions.Configuration;
using Progressive.Telematics.Labs.Shared.Configs;
using Progressive.Telematics.Labs.Shared.Utils;
using Progressive.WAM.Webguard.Client.Core.Wcf;
using Progressive.WAM.Webguard.Client.Kerberos.Core.Wcf;
using System;
using System.Runtime.InteropServices;
using System.ServiceModel.Description;

namespace Progressive.Telematics.Labs.Shared.Extensions
{
    /// <summary>
    /// Extension methods for WCF ServiceEndpoint to add authentication behaviors.
    /// </summary>
    public static class ServiceEndpointExtensions
    {
        /// <summary>
        /// Adds Webguard authentication token endpoint behavior to the WCF service endpoint.
        /// On Windows, uses Kerberos JWT authentication. On Linux, uses client credentials JWT authentication.
        /// </summary>
        /// <param name="endpoint">The service endpoint to configure.</param>
        /// <param name="configuration">The application configuration to retrieve client credentials from.</param>
        public static void AddTokenEndpoint(this ServiceEndpoint endpoint, IConfiguration configuration)
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

        /// <summary>
        /// Adds legacy token endpoint behavior to the WCF service endpoint.
        /// </summary>
        /// <param name="endpoint">The service endpoint to configure.</param>
        public static void AddTokenEndpoint(this ServiceEndpoint endpoint)
        {
            endpoint.EndpointBehaviors.Add(new TokenEndpointBehavior(AppServicesHelper.GetConfig<WebguardConfig>().AuthenticationServiceUrl));
        }
    }
}
