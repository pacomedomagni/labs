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
using Progressive.Telematics.Admin.Services;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared.Configs;
using Xunit;

namespace Telematics.Admin.Services.Tests.Api
{
	public class ClaimsParticipantManagementApiTests
	{
		private Mock<ILogger<ClaimsParticipantManagementApi>> logger;
		private IOptions<ServicesConfig> serviceConfig;
		private IOptions<EnvironmentPrefixes> envConfig;

		private string baseApiUri = "http://someurl-{env}/";

		public ClaimsParticipantManagementApiTests()
		{
			logger = new Mock<ILogger<ClaimsParticipantManagementApi>>();
			serviceConfig = Options.Create(new ServicesConfig()
			{
				ClaimsParticipantManagementApi = new ApiConfig
				{
					BaseUrl = baseApiUri,
					Endpoints = new Dictionary<string, string> { 
						{ "PolicySummary", "v1/policySummary/{0}" },
						{ "ParticipantSummary", "v1/participantSummary/{0}" },
                        { "Unenroll", "v1/unenroll" }
                    }
				}
			});
			envConfig = Options.Create(new EnvironmentPrefixes() { AWS = "aws" });
		}

		[Fact]
		public async Task ShouldCreateBaseUrlAppropriately()
		{
			var handler = HttpUnitTestHelper.SetupMockHttpHandler<List<ClaimsParticipantSummaryResponse>> (HttpStatusCode.OK);
            HttpClient httpClient = new HttpClient(handler.Object);
            var mockFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
            mockFactory
              .Setup(factory => factory.CreateClient("ModernToken"))
              .Returns(httpClient)
              .Verifiable();
            var api = new ClaimsParticipantManagementApi(logger.Object, mockFactory.Object, serviceConfig, envConfig);

			await api.GetPolicySummary(It.IsAny<string>());

			Assert.Equal(baseApiUri.Replace("{env}", envConfig.Value.AWS), httpClient.BaseAddress.AbsoluteUri);
		}

		public static IEnumerable<object[]> PolicySummaryResponseData()
		{
			yield return new object[] { HttpStatusCode.OK, new ClaimsPolicySummaryResponse {
				PolicyNumber = "PolicyNumber",
				ParticipantSummaries = new List<ClaimsParticipantSummaryResponse>() {
					new ClaimsParticipantSummaryResponse {
						IsAccidentResponseActivated = true,
						IsAccidentResponseEnrolled = true,
						AccidentResponseActivationDateTime = DateTime.Now,
						DriverReferenceId = "1",
						TelematicsId = Guid.NewGuid().ToString()
					}
				}
			}};
			yield return new object[] { HttpStatusCode.NotFound, null };
			yield return new object[] { HttpStatusCode.BadRequest, null };
			yield return new object[] { HttpStatusCode.InternalServerError, null };
		}

		[Theory]
		[MemberData(nameof(PolicySummaryResponseData))]
		public async Task GetPolicySummary_Tests(HttpStatusCode status, ClaimsPolicySummaryResponse responseContent)
		{
			var handler = HttpUnitTestHelper.SetupMockHttpHandler(status, responseContent?.ParticipantSummaries);
            HttpClient httpClient = new HttpClient(handler.Object);
            var mockFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
            mockFactory
              .Setup(factory => factory.CreateClient("ModernToken"))
              .Returns(httpClient)
              .Verifiable();
            var api = new ClaimsParticipantManagementApi(logger.Object, mockFactory.Object, serviceConfig, envConfig);
			
			var response = await api.GetPolicySummary("PolicyNumber");
			response.ShouldDeepEqual(responseContent);
		}

		[Theory]
		[MemberData(nameof(PolicySummaryResponseData))]
		public async Task GetParticipantSummary_Tests(HttpStatusCode status, ClaimsPolicySummaryResponse policyResponse)
		{
			var participantResponse = policyResponse?.ParticipantSummaries.First();
			var handler = HttpUnitTestHelper.SetupMockHttpHandler(status, participantResponse);
            HttpClient httpClient = new(handler.Object);
            var mockFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
            mockFactory
              .Setup(factory => factory.CreateClient("ModernToken"))
              .Returns(httpClient)
              .Verifiable();
            var api = new ClaimsParticipantManagementApi(logger.Object, mockFactory.Object, serviceConfig, envConfig);

			var response = await api.GetParticipantSummary("TelematicsId");
			response.ShouldDeepEqual(participantResponse);
		}

        [Theory]
        [InlineData(HttpStatusCode.OK, true)]
        [InlineData(HttpStatusCode.BadRequest, false)]
        [InlineData(HttpStatusCode.InternalServerError, false)]
        public async Task Unenroll_Tests(HttpStatusCode status, bool expectedResult)
        {
            // Arrange
            var telematicsId = "testTelematicsId";
            var unenrollReason = "testReason";
            var handler = HttpUnitTestHelper.SetupMockHttpHandler(status, new { telematicsId, unenrollReason });
            HttpClient httpClient = new(handler.Object);
            var mockFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
            mockFactory
                .Setup(factory => factory.CreateClient("ModernToken"))
                .Returns(httpClient)
                .Verifiable();

            var api = new ClaimsParticipantManagementApi(logger.Object, mockFactory.Object, serviceConfig, envConfig);

            // Act
            var result = await api.Unenroll(telematicsId, unenrollReason);

            // Assert
            Assert.Equal(expectedResult, result);
            mockFactory.Verify();
        }
    }
}
