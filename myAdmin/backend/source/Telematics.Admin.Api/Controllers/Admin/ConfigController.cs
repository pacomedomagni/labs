using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Admin.Shared.Configs;
using Progressive.Telematics.Admin.Shared.Utils;
using System.Text;
using System;
using Progressive.WAM.Webguard.Client.Core.Wcf;
using Microsoft.Extensions.Configuration;

namespace Progressive.Telematics.Admin.Api.Controllers.Admin
{
	[ApiController]
	[Route("api/[controller]")]
	[Produces("application/json")]
	public class ConfigController : ControllerBase
	{
		WebguardConfig _webguardConfig;
		WebguardClient _webguardClient;
		ServicesConfig _servicesConfig;
		LoggingConfig _loggingConfig;
		ConnectionStringsConfig _databaseConfig;
        readonly IConfiguration _configuration;

        public ConfigController(IOptions<WebguardConfig> webGuard, IOptions<ServicesConfig> servicesConfig, IOptions<LoggingConfig> loggingConfig, IOptions<ConnectionStringsConfig> databaseConfig, IOptions<WebguardClient> webGuardClient, IConfiguration configuration)
		{
			_webguardConfig = webGuard.Value;
			_webguardClient = webGuardClient.Value;
			_servicesConfig = servicesConfig.Value;
			_loggingConfig = loggingConfig.Value;
			_databaseConfig = databaseConfig.Value;
            _configuration = configuration;
        }

		[HttpGet("WebGuard")]
		public WebguardConfig WebGuard()
		{
			return _webguardConfig;
        }

        [HttpGet("WebguardClient")]
        public WebguardClient WebguardClient()
        {
            return _webguardClient;
        }

        [HttpGet("Services")]
		public ServicesConfig Services()
		{
			return _servicesConfig;
		}

		[HttpGet("Logging")]
		public LoggingConfig Logging()
		{
			return _loggingConfig;
		}

		[HttpGet("Database")]
		public ConnectionStringsConfig Database()
		{
			return _databaseConfig;
		}


    }
}
