using System;
using System.Linq;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Labs.Business.Mappers;
using Progressive.Telematics.Labs.Services.Api;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using ServiceDeviceActivityService = Progressive.Telematics.Labs.Services.Wcf.IDeviceActivityService;

namespace Progressive.Telematics.Labs.Business.Tests
{
    public class Services
    {
        public Mock<IDailyDrivingAggregateService> DailyDrivingAggregate { get; set; }
        public Mock<ServiceDeviceActivityService> DeviceActivity { get; set; }
        public Mock<IDeviceLotService> DeviceLot { get; set; }
        public Mock<IParticipantService> Participant { get; set; }
      //  public Mock<IPolicyService> Policy { get; set; }
        public Mock<ITransactionAuditLogService> TransactionAuditLog { get; set; }
        public Mock<IValueCalculatorService> ValueCalculator { get; set; }
        public Mock<IXirgoDeviceService> XirgoDevice { get; set; }
        public Mock<IXirgoSessionService> XirgoSession { get; set; }
        public Mock<IBenchTestBoardService> BenchTestBoard { get; set; }
        public Mock<IBenchTestService> BenchTest { get; set; }
    }

    public class Apis
    {
        
        //public Mock<ICommonApi> Common { get; set; }
        //public Mock<IDeviceApi> Device { get; set; }
        //public Mock<IPolicyDeviceApi> PolicyDevice { get; set; }
       
        //public Mock<IUbiApi> UbiApi { get; set; }
        //public Mock<ITrialApi> Trial { get; set; }
        //public Mock<IPolicyServicingApi> PolicyServicing { get; set; }
    }

    public class Databases
    {
        //public Mock<IHomebaseDAL> Homebase { get; set; }
        //public Mock<IPolicyDAL> Policy { get; set; }
        //public Mock<ITripDetailsDAL> TripDetails { get; set; }
    }

    public class Orchestrators
    {
        //public Mock<IParticipantActionsOrchestrator> Participant { get; set; }
        //public Mock<IPluginActionsOrchestrator> Plugin { get; set; }
        //public Mock<IPolicyOrchestrator> Policy { get; set; }
        //public Mock<IArePolicyOrchestrator> ArePolicy { get; set; }
        //public Mock<ISnapshotPolicyOrchestrator> SnapshotPolicy { get; set; }
        //public Mock<IMobileActionsOrchestrator> Mobile { get; set; }
        //public Mock<IRegistrationOrchestrator> Registration { get; set; }
        //public Mock<IScoringAlgorithmsOrchestrator> ScoringAlgorithmOrchestrator { get; set; }
    }

    public abstract class TestBase<T, T2>
    {
        protected T2 Orchestrator { get; set; }
        protected IMapper Mapper { get; private set; }
        protected Apis Apis { get; set; }
        protected Databases Databases { get; set; }
        protected Services Services { get; private set; }
        protected Orchestrators Orchestrators { get; set; }
        protected Mock<ILogger<T>> Logger { get; set; }
        protected IHttpContextAccessor HttpContextAccessor { get; set; }
        protected string CurrentUser { get { return HttpContextAccessor.HttpContext.Request.Headers[HttpContextExtensions.TMX_USER_HEADER]; } }

        protected TestBase()
        {
            Logger = new Mock<ILogger<T>>();
            MockHttpContext();
            MockApis();
            mockDatabases();
            MockServices();
            MockMappers();
            MockOrchestrators();
        }

        private void MockHttpContext()
        {
            HttpContextAccessor = Mock.Of<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            context.Request.Headers[HttpContextExtensions.TMX_USER_HEADER] = "Current User";
            Mock.Get(HttpContextAccessor).Setup(_ => _.HttpContext).Returns(context);
        }

        private void MockApis()
        {
            Apis = new Apis
            {
                //ClaimsParticipantManagement = new Mock<IClaimsParticipantManagementApi>(),
                //Common = new Mock<ICommonApi>(),
                //Device = new Mock<IDeviceApi>(),
                //HomebaseParticipantManagement = new Mock<IHomebaseParticipantManagementApi>(),
                //Policy = new Mock<IPolicyApi>(),
                //PolicyDevice = new Mock<IPolicyDeviceApi>(),
                //PolicyTrip = new Mock<IPolicyTripApi>(),
                //UbiApi = new Mock<IUbiApi>(),
                //Trial = new Mock<ITrialApi>(),
                //PolicyServicing = new Mock<IPolicyServicingApi>()

            };
        }

        private void mockDatabases()
        {
            Databases = new Databases
            {
                //Homebase = new Mock<IHomebaseDAL>(),
                //Policy = new Mock<IPolicyDAL>(),
                //TripDetails = new Mock<ITripDetailsDAL>()
            };
        }

        private void MockServices()
        {
            Services = new Services
            {
                DailyDrivingAggregate = new Mock<IDailyDrivingAggregateService>(),
                DeviceActivity = new Mock<ServiceDeviceActivityService>(),
                DeviceLot = new Mock<IDeviceLotService>(),
                Participant = new Mock<IParticipantService>(),
                TransactionAuditLog = new Mock<ITransactionAuditLogService>(),
                ValueCalculator = new Mock<IValueCalculatorService>(),
                XirgoDevice = new Mock<IXirgoDeviceService>(),
                XirgoSession = new Mock<IXirgoSessionService>(),
                BenchTestBoard = new Mock<IBenchTestBoardService>(),
                BenchTest = new Mock<IBenchTestService>()
            };
        }

        private void MockOrchestrators()
        {
            Orchestrators = new Orchestrators
            {
                //ArePolicy = new Mock<IArePolicyOrchestrator>(),
                //Policy = new Mock<IPolicyOrchestrator>(),
                //SnapshotPolicy = new Mock<ISnapshotPolicyOrchestrator>(),
                //Mobile = new Mock<IMobileActionsOrchestrator>(),
                //Participant = new Mock<IParticipantActionsOrchestrator>(),
                //Plugin = new Mock<IPluginActionsOrchestrator>(),
                //Registration = new Mock<IRegistrationOrchestrator>(),
                //ScoringAlgorithmOrchestrator = new Mock<IScoringAlgorithmsOrchestrator>()
            };
        }

        private void MockMappers()
        {
            var mockMapper = new MapperConfiguration(cfg =>
            {
                //cfg.AddProfile(typeof(AreMappers));
                //cfg.AddProfile(typeof(DevicePrepMappers));
                //cfg.AddProfile(typeof(SharedMappers));
                //cfg.AddProfile(typeof(SnapshotMappers));
            });
            Mapper = mockMapper.CreateMapper();
        }

        protected void VerifyAllServices()
        {
            Action<Type, object> verification = (type, obj) => type.GetProperties()
                .Where(x => x.PropertyType.IsGenericType && x.PropertyType.GetGenericTypeDefinition() == typeof(Mock<>))
                .ForEach(x => ((Mock)x.GetValue(obj, null)).VerifyAll());

            verification(typeof(Apis), Apis);
            verification(typeof(Databases), Databases);
            verification(typeof(Orchestrators), Orchestrators);
            verification(typeof(Services), Services);
            Logger.Verify();
        }
    }
}

