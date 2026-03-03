using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Shared.Configs;
using System.ServiceModel;
using WcfDevice;
using WcfDeviceActivityService;
using WcfDeviceLotService;
using WcfDrivingDailyAggregateService;
using WcfEligibleZipCodesService;
using WcfIncidentResolutionService;
using WcfIneligibleVehiclesService;
using WcfParticipantService;
using WcfPolicyService;
using WcfUserManagementService;
using WcfValueCalculator;
using WcfXirgoService;
using WcfXirgoSessionService;

namespace Progressive.Telematics.Admin.Services.Wcf
{
	[SingletonService]
	public interface IWcfServiceFactory
	{
		DeviceServiceClient CreateDeviceClient();
		DeviceActivityServiceClient CreateDeviceActivityClient();
		DeviceLotServiceClient CreateDeviceLotClient();
		EligibleZipCodesServiceClient CreateEligibleZipCodesClient();
		GetDrivingDailyAggregateServiceClient CreateDrivingDailyAggregateClient();
		IncidentResolutionServiceClient CreateIncidentResolutionClient();
		IneligibleVehiclesServiceClient CreateIneligibleVehiclesClient();
		ParticipantServiceClient CreateParticipantClient();
		PolicyServiceClient CreatePolicyServiceClient();
		WcfTransactionAuditLogService.TransactionAuditLogServiceClient CreateTransactionAuditLogServiceClient();
		EntityServiceClient CreateUserManagementServiceClient();
		ValueCalculatorClient CreateValueCalculatorClient();
		XirgoServiceClient CreateXirgoServiceClient();
		XirgoSessionServiceClient CreateXirgoSessionServiceClient();
	}
	public class WcfServiceFactory : IWcfServiceFactory
	{
		ServicesConfig _config;
        readonly IConfiguration _configuration;

        public WcfServiceFactory(IOptions<ServicesConfig> config, IConfiguration configuration)
        {
            _config = config.Value;
            _configuration = configuration;
        }

        public DeviceActivityServiceClient CreateDeviceActivityClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["DeviceActivity"].FormatServiceUrl());
			var client = new DeviceActivityServiceClient(DeviceActivityServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public DeviceServiceClient CreateDeviceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["Device"].FormatServiceUrl());
			var client = new DeviceServiceClient(DeviceServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public DeviceLotServiceClient CreateDeviceLotClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["DeviceLot"].FormatServiceUrl());
			var client = new DeviceLotServiceClient(DeviceLotServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public EligibleZipCodesServiceClient CreateEligibleZipCodesClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["EligibleZipCodes"].FormatServiceUrl());
			var client = new EligibleZipCodesServiceClient(EligibleZipCodesServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public GetDrivingDailyAggregateServiceClient CreateDrivingDailyAggregateClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["DailyDrivingAggregate"].FormatServiceUrl());
			var client = new GetDrivingDailyAggregateServiceClient(GetDrivingDailyAggregateServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public IncidentResolutionServiceClient CreateIncidentResolutionClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["IncidentResolution"].FormatServiceUrl());
			var client = new IncidentResolutionServiceClient(IncidentResolutionServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public IneligibleVehiclesServiceClient CreateIneligibleVehiclesClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["IneligibleVehicles"].FormatServiceUrl());
			var client = new IneligibleVehiclesServiceClient(IneligibleVehiclesServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public ParticipantServiceClient CreateParticipantClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["Participant"].FormatServiceUrl());
			var client = new ParticipantServiceClient(ParticipantServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public PolicyServiceClient CreatePolicyServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["Policy"].FormatServiceUrl());
			var client = new PolicyServiceClient(PolicyServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public WcfTransactionAuditLogService.TransactionAuditLogServiceClient CreateTransactionAuditLogServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["TransactionAuditService"].FormatServiceUrl());
			var client = new WcfTransactionAuditLogService.TransactionAuditLogServiceClient(WcfTransactionAuditLogService.TransactionAuditLogServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public EntityServiceClient CreateUserManagementServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["UserManagement"].FormatServiceUrl());
			var client = new EntityServiceClient(EntityServiceClient.DefaultBinding(), endpoint);
            client.Endpoint.AddTokenEndpoint(_configuration);
            return client;
		}

		public ValueCalculatorClient CreateValueCalculatorClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["ValueCalculator"].FormatServiceUrl());
			var client = new ValueCalculatorClient(ValueCalculatorClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public XirgoServiceClient CreateXirgoServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["Xirgo"].FormatServiceUrl());
			var client = new XirgoServiceClient(XirgoServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public XirgoSessionServiceClient CreateXirgoSessionServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["XirgoSession"].FormatServiceUrl());
			var client = new XirgoSessionServiceClient(XirgoSessionServiceClient.DefaultBinding(), endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}
	}
}
