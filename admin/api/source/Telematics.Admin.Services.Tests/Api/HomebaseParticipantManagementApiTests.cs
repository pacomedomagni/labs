using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using DeepEqual.Syntax;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared.Configs;
using Progressive.WAM.Webguard.Client.Core;
using Xunit;

namespace Telematics.Admin.Services.Tests.Api
{
    public class HomebaseParticipantManagementApiTests
    {
        private readonly Mock<ILogger<HomebaseParticipantManagementApi>> _logger = new();
        private readonly IOptions<ServicesConfig> _serviceConfig = Options.Create(new ServicesConfig()
        {
            HomebaseParticipantManagementApi = new ApiConfig
            {
                BaseUrl = BaseApiUri,
                Endpoints = new Dictionary<string, string> {
                    { "PolicySummary", "v1/policySummary/{0}" },
                    { "ParticipantSummary", "v1/participantSummary/{0}" },
                    { "ParticipantMobileDevice", "v1/ParticipantMobileDevice/{0}" }
                }
            }
        });
        private readonly IOptions<EnvironmentPrefixes> _envConfig = Options.Create(new EnvironmentPrefixes() { AWS = "aws" });

        private const string BaseApiUri = "http://someurl-{env}/";

        [Fact]
        public async Task ShouldCreateBaseUrlAppropriately()
        {
            var handler = HttpUnitTestHelper.SetupMockHttpHandler<HomebasePolicySummaryResponse>(HttpStatusCode.OK);
            HttpClient httpClient = new HttpClient(handler.Object);
            var mockFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
            mockFactory
              .Setup(factory => factory.CreateClient("ModernToken"))
              .Returns(httpClient)
              .Verifiable();
            var api = new HomebaseParticipantManagementApi(_logger.Object, mockFactory.Object, _serviceConfig, _envConfig);

            await api.GetPolicySummary(It.IsAny<string>());

            Assert.Equal(BaseApiUri.Replace("{env}", _envConfig.Value.AWS), httpClient.BaseAddress.AbsoluteUri);
        }

        [Theory]
        [MemberData(nameof(PolicySummaryResponseData))]
        public async Task GetPolicySummaryTests(HttpStatusCode status, HomebasePolicySummaryResponse responseContent)
        {
            var handler = HttpUnitTestHelper.SetupMockHttpHandler(status, responseContent);
            HttpClient httpClient = new HttpClient(handler.Object);
            var mockFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
            mockFactory
              .Setup(factory => factory.CreateClient("ModernToken"))
              .Returns(httpClient)
              .Verifiable();
            var api = new HomebaseParticipantManagementApi(_logger.Object, mockFactory.Object, _serviceConfig, _envConfig);

            var response = await api.GetPolicySummary("PolicyNumber");
            response.ShouldDeepEqual(responseContent);
        }

        [Theory]
        [MemberData(nameof(PolicySummaryResponseData))]
        public async Task GetParticipantSummaryTests(HttpStatusCode status, HomebasePolicySummaryResponse policyResponse)
        {
            var participantResponse = policyResponse?.Participants.First();
            var handler = HttpUnitTestHelper.SetupMockHttpHandler(status, participantResponse);
            HttpClient httpClient = new HttpClient(handler.Object);
            var mockFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
            mockFactory
              .Setup(factory => factory.CreateClient("ModernToken"))
              .Returns(httpClient)
              .Verifiable();
            var api = new HomebaseParticipantManagementApi(_logger.Object, mockFactory.Object, _serviceConfig, _envConfig);

            var response = await api.GetParticipantSummary("TelematicsId");
            response.ShouldDeepEqual(participantResponse);
        }

        [Theory]
        [MemberData(nameof(ParticipantMobileDeviceResponseData))]
        public async Task GetParticipantMobileDeviceTests(HttpStatusCode status, HomebaseParticipantMobileDeviceResponse participantMobileDeviceResponse)
        {
            var handler = HttpUnitTestHelper.SetupMockHttpHandler(status, participantMobileDeviceResponse);
            HttpClient httpClient = new HttpClient(handler.Object);
            var mockFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
            mockFactory
              .Setup(factory => factory.CreateClient("ModernToken"))
              .Returns(httpClient)
              .Verifiable();
            var api = new HomebaseParticipantManagementApi(_logger.Object, mockFactory.Object, _serviceConfig, _envConfig);

            var response = await api.GetParticipantMobileDevice("TelematicsId");
            response.ShouldDeepEqual(participantMobileDeviceResponse);
        }

        public static IEnumerable<object[]> PolicySummaryResponseData()
        {
            yield return new object[] { HttpStatusCode.OK, new HomebasePolicySummaryResponse {
                Policy = "PolicyNumber",
                Participants = new List<HomebaseParticipantSummaryResponse>() {
                    new()
                    {
                        UBIEnrolled = true,
                        UBIActivated = true,
                        DriverReferenceId = "1",
                        TelematicsId = Guid.NewGuid().ToString()
                    }
                }
            }};
            yield return new object[] { HttpStatusCode.NotFound, null };
            yield return new object[] { HttpStatusCode.BadRequest, null };
            yield return new object[] { HttpStatusCode.InternalServerError, null };
        }
		
        public static IEnumerable<object[]> ParticipantMobileDeviceResponseData()
        {
            yield return new object[] { HttpStatusCode.OK, new HomebaseParticipantMobileDeviceResponse {
                TelematicsId = "TelematicsId",
                MobileOSName = "MobileOsName",
                MobileOSVersionName = "MobileOSVersionName",
                MobileAppVersionName = "MobileAppVersionName",
                MobileDeviceModelName = "MobileDeviceModelName",
                MobileDeviceId = "MobileDeviceId"
            }};
            yield return new object[] { HttpStatusCode.NotFound, null };
            yield return new object[] { HttpStatusCode.BadRequest, null };
            yield return new object[] { HttpStatusCode.InternalServerError, null };
        }
    }
}
