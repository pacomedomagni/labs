using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.Text;
using System.Xml;
using ParticipantGroupService;
using WcfSimManagementService;
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
using WcfVinPicklistService;
using WcfXirgoService;
using WcfXirgoSessionService;
using BenchTestBoardService;
using BenchTestServices;
using WCFBusinessDeviceOrderService;
using MyScoreCodeTablesClient = WCFCodeTablesService.CodeTablesServiceClient;
using WCFDeviceOrderSummaryService;
using HomeBaseCodeTablesClient = WCFHomeBaseCodeTablesService.CodeTablesServiceClient;
using WCFMobileDeviceOrderService;
using DeviceOrderClient = WCFDeviceOrderService.DeviceOrderServiceClient;
using AppConfigClient = WCFAppConfigService.AppConfigServiceClient;

namespace Progressive.Telematics.Labs.Services.Wcf
{
	[SingletonService]
	public interface IWcfServiceFactory
	{
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
        SimManagementServiceClient CreateSimManagementServiceClient();
		XirgoSessionServiceClient CreateXirgoSessionServiceClient();
        VinPicklistServiceClient CreateVinPicklistServiceClient();
        ParticipantGroupServiceClient CreateParticipantGroupServiceClient();
		BenchTestBoardServiceClient CreateBenchTestBoardServiceClient();
			BenchTestServiceClient CreateBenchTestServiceClient();
			AppConfigClient CreateWCFAppConfigServiceClient();
			BusinessDeviceOrderServiceClient CreateWCFBusinessDeviceOrderServiceClient();
			MyScoreCodeTablesClient CreateWCFCodeTablesServiceClient();
			DeviceOrderClient CreateWCFDeviceOrderServiceClient();
			DeviceOrderSummaryServiceClient CreateWCFDeviceOrderSummaryServiceClient();
			HomeBaseCodeTablesClient CreateWCFHomeBaseCodeTablesServiceClient();
			MobileDeviceOrderServiceClient CreateWCFMobileDeviceOrderServiceClient();
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
			var serviceUrl = _config.WcfServices["DeviceActivity"].FormatServiceUrl();
			var endpoint = new EndpointAddress(serviceUrl);
			var binding = CreateDeviceActivityBinding(endpoint);
			var client = new DeviceActivityServiceClient(binding, endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		static Binding CreateDeviceActivityBinding(EndpointAddress endpoint)
		{
			var textEncoding = new TextMessageEncodingBindingElement(MessageVersion.Soap12WSAddressing10, Encoding.UTF8)
			{
				ReaderQuotas = XmlDictionaryReaderQuotas.Max
			};

			HttpTransportBindingElement transport = string.Equals(endpoint.Uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase)
				? new HttpsTransportBindingElement()
				: new HttpTransportBindingElement();

			transport.AllowCookies = true;
			transport.MaxBufferSize = int.MaxValue;
			transport.MaxReceivedMessageSize = int.MaxValue;

			return new CustomBinding(textEncoding, transport);
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
			client.Endpoint.AddTokenEndpoint();
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

        public SimManagementServiceClient CreateSimManagementServiceClient()
        {
            var endpoint = new EndpointAddress(_config.WcfServices["SimManagement"].FormatServiceUrl());
            var client = new SimManagementServiceClient(SimManagementServiceClient.DefaultBinding(), endpoint);
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

        public VinPicklistServiceClient CreateVinPicklistServiceClient()
        {
			var endpoint = new EndpointAddress(_config.WcfServices["VinPicklist"].FormatServiceUrl());
            var client = new VinPicklistServiceClient(VinPicklistServiceClient.DefaultBinding(), endpoint);
			return client;
        }

        public ParticipantGroupServiceClient CreateParticipantGroupServiceClient()
        {
            var endpoint = new EndpointAddress(_config.WcfServices["ParticipantGroup"].FormatServiceUrl());
            var client = new ParticipantGroupServiceClient(ParticipantGroupServiceClient.DefaultBinding(), endpoint);
            client.Endpoint.AddTokenEndpoint(_configuration);
            return client;
        }

        public BenchTestBoardServiceClient CreateBenchTestBoardServiceClient()
        {
            var endpoint = new EndpointAddress(_config.WcfServices["BenchTestBoard"].FormatServiceUrl());
            var client = new BenchTestBoardServiceClient(BenchTestBoardServiceClient.DefaultBinding(), endpoint);
            client.Endpoint.AddTokenEndpoint(_configuration);
            return client;
        }

		public BenchTestServiceClient CreateBenchTestServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["BenchTest"].FormatServiceUrl());
			var binding = new WSHttpBinding
			{
				ReaderQuotas = XmlDictionaryReaderQuotas.Max,
				MaxReceivedMessageSize = int.MaxValue,
				AllowCookies = true,
				Security = { Mode = SecurityMode.None }
			};
			var client = new BenchTestServiceClient(binding, endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public AppConfigClient CreateWCFAppConfigServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["WCFAppConfig"].FormatServiceUrl());
			var binding = new BasicHttpBinding
			{
				MaxReceivedMessageSize = int.MaxValue,
				AllowCookies = true,
				Security = { Mode = BasicHttpSecurityMode.TransportCredentialOnly, Transport = { ClientCredentialType = HttpClientCredentialType.Windows } }
			};
			var client = new AppConfigClient(binding, endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public BusinessDeviceOrderServiceClient CreateWCFBusinessDeviceOrderServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["WCFBusinessDeviceOrder"].FormatServiceUrl());
			var binding = new WSHttpBinding
			{
				ReaderQuotas = XmlDictionaryReaderQuotas.Max,
				MaxReceivedMessageSize = int.MaxValue,
				AllowCookies = true,
				Security = { Mode = SecurityMode.None }
			};
			var client = new BusinessDeviceOrderServiceClient(binding, endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public MyScoreCodeTablesClient CreateWCFCodeTablesServiceClient()
			{
				var endpoint = new EndpointAddress(_config.WcfServices["WCFCodeTables"].FormatServiceUrl());
				var binding = new WSHttpBinding
				{
					ReaderQuotas = XmlDictionaryReaderQuotas.Max,
					MaxReceivedMessageSize = int.MaxValue,
					AllowCookies = true,
					Security = { Mode = SecurityMode.None }
				};
				var client = new MyScoreCodeTablesClient(binding, endpoint);
				client.Endpoint.AddTokenEndpoint(_configuration);
				return client;
			}

			public DeviceOrderClient CreateWCFDeviceOrderServiceClient()
			{
				var endpoint = new EndpointAddress(_config.WcfServices["WCFDeviceOrder"].FormatServiceUrl());
				var binding = new WSHttpBinding
				{
					ReaderQuotas = XmlDictionaryReaderQuotas.Max,
					MaxReceivedMessageSize = int.MaxValue,
					AllowCookies = true,
					Security = { Mode = SecurityMode.None }
				};
				var client = new DeviceOrderClient(binding, endpoint);
				client.Endpoint.AddTokenEndpoint(_configuration);
				return client;
			}

			public DeviceOrderSummaryServiceClient CreateWCFDeviceOrderSummaryServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["WCFDeviceOrderSummary"].FormatServiceUrl());
			var binding = new WSHttpBinding
			{
				ReaderQuotas = XmlDictionaryReaderQuotas.Max,
				MaxReceivedMessageSize = int.MaxValue,
				AllowCookies = true,
				Security = { Mode = SecurityMode.None }
			};
			var client = new DeviceOrderSummaryServiceClient(binding, endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public HomeBaseCodeTablesClient CreateWCFHomeBaseCodeTablesServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["WCFHomeBaseCodeTables"].FormatServiceUrl());
			var binding = new WSHttpBinding
			{
				ReaderQuotas = XmlDictionaryReaderQuotas.Max,
				MaxReceivedMessageSize = int.MaxValue,
				AllowCookies = true,
				Security = { Mode = SecurityMode.None }
			};
			var client = new HomeBaseCodeTablesClient(binding, endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}

		public MobileDeviceOrderServiceClient CreateWCFMobileDeviceOrderServiceClient()
		{
			var endpoint = new EndpointAddress(_config.WcfServices["WCFMobileDeviceOrder"].FormatServiceUrl());
			var binding = new WSHttpBinding
			{
				ReaderQuotas = XmlDictionaryReaderQuotas.Max,
				MaxReceivedMessageSize = int.MaxValue,
				AllowCookies = true,
				Security = { Mode = SecurityMode.None }
			};
			var client = new MobileDeviceOrderServiceClient(binding, endpoint);
			client.Endpoint.AddTokenEndpoint(_configuration);
			return client;
		}
	}
}

