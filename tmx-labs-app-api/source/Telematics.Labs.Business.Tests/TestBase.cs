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
        public Mock<ITransactionAuditLogService> TransactionAuditLog { get; set; }
        public Mock<IValueCalculatorService> ValueCalculator { get; set; }
        public Mock<IXirgoDeviceService> XirgoDevice { get; set; }
        public Mock<IXirgoSessionService> XirgoSession { get; set; }
        public Mock<IBenchTestBoardService> BenchTestBoard { get; set; }
        public Mock<IBenchTestService> BenchTest { get; set; }
    }

    public class Apis
    {
    }

    public class Databases
    {
        public Mock<Progressive.Telematics.Labs.Services.Database.ILotManagementDAL> LotManagement { get; set; }
        public Mock<Progressive.Telematics.Labs.Services.Database.IBenchTestBoardDAL> BenchTestBoardDAL { get; set; }
        public Mock<Progressive.Telematics.Labs.Services.Database.IConfigValuesDAL> ConfigValues { get; set; }
    }

    public abstract class TestBase<T, T2>
    {
        protected T2 Orchestrator { get; set; }
        protected IMapper Mapper { get; private set; }
        protected Apis Apis { get; set; }
        protected Databases Databases { get; set; }
        protected Services Services { get; private set; }
        protected Mock<ILogger<T>> Logger { get; set; }
        protected IHttpContextAccessor HttpContextAccessor { get; set; }
        protected string CurrentUser { get { return HttpContextAccessor.HttpContext.Request.Headers[HttpContextExtensions.TMX_USER_HEADER]; } }

        protected TestBase()
        {
            Logger = new Mock<ILogger<T>>();
            MockHttpContext();
            MockApis();
            MockDatabases();
            MockServices();
            MockMappers();
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
            };
        }

        private void MockDatabases()
        {
            Databases = new Databases
            {
                LotManagement = new Mock<Progressive.Telematics.Labs.Services.Database.ILotManagementDAL>(),
                BenchTestBoardDAL = new Mock<Progressive.Telematics.Labs.Services.Database.IBenchTestBoardDAL>(),
                ConfigValues = new Mock<Progressive.Telematics.Labs.Services.Database.IConfigValuesDAL>()
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

        private void MockMappers()
        {
            var mockMapper = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(typeof(SharedMappers));
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
            verification(typeof(Services), Services);
            Logger.Verify();
        }
    }
}

