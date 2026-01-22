using System;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Progressive.AppLogger.NetCore;
using Progressive.AppLogger.NetCore.Console;
using Progressive.Telematics.Labs.Api.Middleware;
using Progressive.Telematics.Labs.Business;
using Progressive.Telematics.Labs.Services;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Configs;
using Progressive.Telematics.Labs.Shared.RetryPolicyProviders;
using Progressive.Telematics.Labs.Shared.Utils;
using Progressive.TMX.AppLogger;
using Progressive.WAM.Webguard.Client.Core;
using Progressive.WAM.Webguard.Client.Kerberos.Core;
using Progressive.WAM.Webguard.Protect.Core;


namespace Progressive.Telematics.Labs.Api
{
    public class Startup
    {
        const string AllowAllOriginsPolicy = "AllowAllOriginsPolicy";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        /* 
        Transient objects are always different; a new instance is provided to every controller and every service.
        Scoped objects are the same within a request, but different across different requests.
        Singleton objects are the same for every object and every request.
        */
        public void ConfigureServices(IServiceCollection services)
        {
            services
                .Configure<WebguardConfig>(Configuration.GetSection("WebguardOptions"))
                .Configure<WebguardClient>(Configuration.GetSection("WebGuardClient"))
                .Configure<ServicesConfig>(Configuration.GetSection("Services"))
                .Configure<ConnectionStringsConfig>(Configuration.GetSection("ConnectionStrings"))
                .Configure<EnvironmentPrefixes>(Configuration.GetSection("EnvironmentPrefixes"))
                .Configure<LoggingConfig>(Configuration.GetSection("TelematicsLogging"))
                .Configure<TranactionAlerts>(Configuration.GetSection("TranactionAlerts"))
                .Configure<HttpRetryConfig>(Configuration.GetSection("RetryOptions"))
                .Configure<VinPicklistConfig>(Configuration.GetSection("VinPicklistOptions"))
                .AddTransient<IRetryPolicyProvider, RetryPolicyProvider>();

            services.AddHealthChecks();
            services
                .AddControllers()
                .AddJsonOptions(options =>
                {
                    // Ensure null values are included in the payload so the front end doesn't deserialize these to undefined
                    options.JsonSerializerOptions.SetDefaultJsonSerializerOptions();
                });

            services
                .AddHttpContextAccessor();

            // These come from the environment variables set within OpenShift
            string clientSecret = Environment.GetEnvironmentVariable(Configuration.GetSection("WebGuardClient").GetValue<String>("ClientSecret"));
            string clientId = Environment.GetEnvironmentVariable(Configuration.GetSection("WebGuardClient").GetValue<String>("ClientId"));
            string modernAuthenticaitonServiceUri = Configuration.GetSection("WebGuardClient").GetValue<string>("ModernAuthorizationServiceUrl");

            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                services.AddTransient<KerberosJwtFactoryAuthorizationHandler>(service =>
                   new KerberosJwtFactoryAuthorizationHandler(modernAuthenticaitonServiceUri))
                   .AddHttpClient("ModernToken")
                   .AddHttpMessageHandler<KerberosJwtFactoryAuthorizationHandler>()
                   .AddPolicyHandler((IServiceProvider sp, HttpRequestMessage hrm) =>
                   {
                       IRetryPolicyProvider retryPolicyProvider = sp.GetRequiredService<IRetryPolicyProvider>();
                       return retryPolicyProvider.HttpRetryPolicy;
                   });
            }
            else
            {
                services.AddTransient<JwtFactoryAuthorizationHandler>(service =>
                   new JwtFactoryAuthorizationHandler(modernAuthenticaitonServiceUri,
                                                      clientId,
                                                      clientSecret))
                   .AddHttpClient("ModernToken")
                   .AddHttpMessageHandler<JwtFactoryAuthorizationHandler>()
                   .AddPolicyHandler((IServiceProvider sp, HttpRequestMessage hrm) =>
				   {
					   IRetryPolicyProvider retryPolicyProvider = sp.GetRequiredService<IRetryPolicyProvider>();
					   return retryPolicyProvider.HttpRetryPolicy;
				   });
			}

            services
                .AddTelematicsBusinessLayer()
                .AddTelematicsServiceLayer(Configuration)
                .AddTelematicsLogging(CreateLoggingOptions())
                .AddMemoryCache();

            services.AddCors(options =>
            {
                options.AddPolicy(AllowAllOriginsPolicy,
                builder => builder
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .WithExposedHeaders("x-pagination"));
            });

            services.AddSwaggerGen(c =>
                {
                    c.AddIGuardAndJwtSupport();
                })
            .AddWebguard(Configuration);

#if DEBUG
            // additional settings for local execution
            HttpClient.DefaultProxy.Credentials = CredentialCache.DefaultCredentials;
#endif
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.EnvironmentName == "dev")
                app.UseDeveloperExceptionPage();
            else
                app.UseHsts();

            app
                .UseSwagger()
                .UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Telematics Admin API");
                    c.DefaultModelsExpandDepth(-1);
                })
                .UseHttpsRedirection()
                .UseRouting()
                .UseCors(AllowAllOriginsPolicy)
                .UseRequestTrackingMiddleware()
                .UseMiddleware<ErrorHandler>()
                .UseWebguard()
                .UseEndpoints(endpoints =>
                {
                    endpoints.MapControllers();
                })
                .UseTelematicsLoggerWhenShuttingDown();

            AppServicesHelper.Services = app.ApplicationServices;
        }

        private ConsoleLoggerOptions CreateLoggingOptions()
        {
            var loggingConfig = Configuration.GetSection("TelematicsLogging");
            var env = Enumeration.FromDisplayName<AppEnvironment>(loggingConfig["ApplicationEnvironmentName"]);
            var catMap = TelematicsLoggingConfigurationManager.GetLoggingLevelDefaults<ConsoleLoggerOptions>(env);
            catMap.Add("Progressive", Microsoft.Extensions.Logging.LogLevel.Information);
            catMap.Add("System.Net.Http.HttpClient.*.ClientHandler", Microsoft.Extensions.Logging.LogLevel.Information);

			return new ConsoleLoggerOptions(
                loggingComputerSystemName: Environment.MachineName,
                    appSiteName: loggingConfig["ApplicationSiteName"],
                    appEnvironment: env,
                    bapName: loggingConfig["ApplicationName"],
                    categoryMapToMinimumLogLevel: catMap
                )
            {
                AppSubLevelName = loggingConfig["ApplicationSubName"]
            };
        }
    }
}

