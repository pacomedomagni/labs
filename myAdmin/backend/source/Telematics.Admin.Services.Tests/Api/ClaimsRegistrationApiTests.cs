using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using DeepEqual.Syntax;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Resources.Shared;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models.ClaimsRegistrationApi;
using Progressive.Telematics.Admin.Shared.Configs;
using Xunit;

namespace Telematics.Admin.Services.Tests.Api
{
    public class ClaimsRegistrationApiTests
    {
        private readonly ILogger<ClaimsRegistrationApi> _logger;
        private readonly IHttpClientFactory _clientFactory;
        private readonly ApiConfig _apiConfig;
        private readonly ServicesConfig _servicesConfig;
        private readonly IOptions<ServicesConfig> _optionsServicesConfig;
        private readonly EnvironmentPrefixes _envPrefixes;
        private readonly IOptions<EnvironmentPrefixes> _optionsEnvPrefixes;
        private readonly IPolicyDAL _policyDAL;

        public ClaimsRegistrationApiTests()
        {
            _logger = Substitute.For<ILogger<ClaimsRegistrationApi>>();
            _clientFactory = Substitute.For<IHttpClientFactory>();
            _apiConfig = new ApiConfig
            {
                BaseUrl = "http://test/",
                Endpoints = new Dictionary<string, string>
                    {
                        { "UpdateMobileRegistrationCode", "v3/updateMobileRegistrationCode" },
                        { "GetRegistrations", "v3/registrations" }
                    }
            };
            _servicesConfig = new ServicesConfig
            {
                ClaimsRegistrationApi = _apiConfig
            };
            _optionsServicesConfig = Substitute.For<IOptions<ServicesConfig>>();
            _optionsServicesConfig.Value.Returns(_servicesConfig);

            _envPrefixes = new EnvironmentPrefixes
            {
                AWS = "aws",
                OnPrem = "onprem",
                OpenShift = "openshift",
                SQL = "sql",
                EnvironmentName = "test"
            };
            _optionsEnvPrefixes = Substitute.For<IOptions<EnvironmentPrefixes>>();
            _optionsEnvPrefixes.Value.Returns(_envPrefixes);
            _policyDAL = Substitute.For<IPolicyDAL>();
        }

        [Fact]
        public async Task UpdateMobileRegistrationCode_ReturnsSuccess_WhenClaimsRegApiReturnsSuccessStatusCode()
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            ClaimsRegistrationApi sut = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);

            var result = await sut.UpdateMobileRegistrationCode("currentCode", "newCode", "telematicsId");

            Assert.True(result.Success);
            Assert.Equal(string.Empty, result.ErrorMessage);
        }

        [Fact]
        public async Task UpdateMobileRegistrationCode_ReturnsFailure_WhenApiReturnsErrorStatusCode()
        {
            string errorJson = "{\"errorCode\":102,\"developerMessage\":\"The mobile registration code provided is currently in use by another participant.\"}";
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent(errorJson)
            };
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            ClaimsRegistrationApi api = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);

            var result = await api.UpdateMobileRegistrationCode("currentCode", "newCode", "telematicsId");

            Assert.False(result.Success);
            Assert.Equal("The mobile registration code provided is currently in use by another participant.", result.ErrorMessage);
        }

        [Fact]
        public async Task GetRegistrations_ReturnsActiveRegistration_WhenApiReturnsActiveRegistration()
        {
            var activeRegistration = new RegistrationsModel
            {
                MobileRegistrationCode = "activeCode",
                TelematicsId = "telematicsId",
                StatusSummary = "New",
                ChallengeRequestCount = 1,
                ChallengeExpirationDateTime = DateTime.UtcNow.AddDays(1),
                MobileDevice = new RegistrationMobileDevice { MobileDeviceId = "deviceId" },
                ChallengeCode = "challengeCode"
            };
            var model = new MobileRegistrationsModel
            {
                ActiveRegistration = activeRegistration,
                OtherRegistrations = null
            };
            var json = System.Text.Json.JsonSerializer.Serialize(model);
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json")
            };
            _apiConfig.Endpoints["GetRegistrations"] = "v3/getRegistrations";
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            var sut = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);
            var result = await sut.GetRegistrations("telematicsId");

            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("activeCode", result[0].MobileRegistrationCode);
            Assert.Equal("telematicsId", result[0].ParticipantExternalId);
            Assert.Equal("New", result[0].StatusSummary.ToString());
            Assert.Equal(1, result[0].ChallengeRequestCount);
            Assert.Equal("deviceId", result[0].MobileDeviceId);
            Assert.Equal("challengeCode", result[0].MobileChallengeCode);
        }

        [Fact]
        public async Task GetRegistrations_ReturnsOtherRegistration_WhenApiReturnsOtherRegistrationsOnly()
        {
            var otherRegistration = new RegistrationsModel
            {
                MobileRegistrationCode = "otherCode",
                TelematicsId = "telematicsId2",
                StatusSummary = "Inactive",
                ChallengeRequestCount = 2,
                ChallengeExpirationDateTime = DateTime.UtcNow.AddDays(2),
                MobileDevice = new RegistrationMobileDevice { MobileDeviceId = "deviceId2" },
                ChallengeCode = "challengeCode2"
            };
            var model = new MobileRegistrationsModel
            {
                ActiveRegistration = null,
                OtherRegistrations = new List<RegistrationsModel> { otherRegistration }
            };
            var json = System.Text.Json.JsonSerializer.Serialize(model);
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json")
            };
            _apiConfig.Endpoints["GetRegistrations"] = "v3/getRegistrations";
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            var sut = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);
            var result = await sut.GetRegistrations("telematicsId2");

            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("otherCode", result[0].MobileRegistrationCode);
            Assert.Equal("telematicsId2", result[0].ParticipantExternalId);
            Assert.Equal("Inactive", result[0].StatusSummary.ToString());
            Assert.Equal(2, result[0].ChallengeRequestCount);
            Assert.Equal("deviceId2", result[0].MobileDeviceId);
            Assert.Equal("challengeCode2", result[0].MobileChallengeCode);
        }

        [Fact]
        public async Task GetRegistrations_ReturnsNull_WhenApiReturnsNoRegistrations()
        {
            var model = new MobileRegistrationsModel
            {
                ActiveRegistration = null,
                OtherRegistrations = null
            };
            var json = System.Text.Json.JsonSerializer.Serialize(model);
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json")
            };
            _apiConfig.Endpoints["GetRegistrations"] = "v3/getRegistrations";
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            var sut = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);
            var result = await sut.GetRegistrations("telematicsId3");

            Assert.Null(result);
        }

        [Fact]
        public async Task GetRegistrationsByTelematicsId_SuccessfulResponse_ReturnsData()
        {
            var tmxId = "tmxId";
            var mobileRegCode = "mobileRegistrationCode";
            var statusSummary = "New";
            var deviceId = "deviceId";
            var challengeCode = "challengeCode";

            var activeRegistration = new RegistrationsModel
            {
                MobileRegistrationCode = mobileRegCode,
                TelematicsId = tmxId,
                StatusSummary = statusSummary,
                ChallengeRequestCount = 1,
                ChallengeExpirationDateTime = DateTime.UtcNow.AddDays(1),
                MobileDevice = new RegistrationMobileDevice { MobileDeviceId = deviceId },
                ChallengeCode = challengeCode
            };
            var model = new MobileRegistrationsModel
            {
                ActiveRegistration = activeRegistration,
                OtherRegistrations = null
            };
            var json = System.Text.Json.JsonSerializer.Serialize(model);
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json")
            };
            _apiConfig.Endpoints["GetRegistrations"] = "v3/getRegistrations";
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            var sut = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);
            var result = await sut.GetRegistrationsByTelematicsId(tmxId);

            Assert.NotNull(result);
            Assert.NotNull(result.ActiveRegistration);
            Assert.Null(result.OtherRegistrations);
            Assert.Equal(tmxId, result.ActiveRegistration.TelematicsId);
            Assert.Equal(mobileRegCode, result.ActiveRegistration.MobileRegistrationCode);
            Assert.Equal(statusSummary, result.ActiveRegistration.StatusSummary);
        }

        [Fact]
        public async Task GetRegistrationsByTelematicsId_NotFound_ReturnsNull()
        {
            var tmxId = "tmxId";

            var response = new HttpResponseMessage(HttpStatusCode.NotFound);
            _apiConfig.Endpoints["GetRegistrations"] = "v3/getRegistrations";
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            var sut = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);
            var result = await sut.GetRegistrationsByTelematicsId(tmxId);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetRegistrationsByTelematicsId_NonSuccessfulResponse_ReturnsNull()
        {
            var tmxId = "tmxId";

            var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
            _apiConfig.Endpoints["GetRegistrations"] = "v3/getRegistrations";
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            var sut = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);
            var result = await sut.GetRegistrationsByTelematicsId(tmxId);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetRegistrationsByPolicyNumber_PolicyDALThrowsException_ReturnsNull()
        {
            var policyNumber = "policyNumber";

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            _policyDAL.GetTelematicsDriversByPolicyNumber(policyNumber).Throws(new Exception());

            var sut = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);
            var result = await sut.GetRegistrationsByPolicyNumber(policyNumber);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetRegistrationsByPolicyNumber_Success_ReturnsListOfRegistrations()
        {
            var policyNumber = "policyNumber";
            var tmxId1 = "tmxId1";

            var registrationModel = new MobileRegistrationsModel()
            {
                ActiveRegistration = new RegistrationsModel()
                {
                    TelematicsId = tmxId1
                }
            };

            var json = System.Text.Json.JsonSerializer.Serialize(registrationModel);
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json")
            };
            _apiConfig.Endpoints["GetRegistrations"] = "v3/getRegistrations";
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            var telematicsDrivers = new List<TelematicsDriver>()
            {
                new TelematicsDriver()
                {
                    ParticipantExternalId = tmxId1,
                }
            };

            var registrations = new List<Registration>
            {
                new Registration()
                {
                    ParticipantExternalId = tmxId1
                }
            };

            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            var sut = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);
            
            _policyDAL.GetTelematicsDriversByPolicyNumber(policyNumber).Returns(telematicsDrivers);

            var result = await sut.GetRegistrationsByPolicyNumber(policyNumber);

            Assert.NotNull(result);
            Assert.Equal(registrations[0].ParticipantExternalId, result[0].ParticipantExternalId);
        }

        [Fact]
        public async Task GetRegistrationsByPolicyNumber_NotFound_ReturnsEmptyList()
        {
            var policyNumber = "policyNumber";
            var tmxId1 = "tmxId1";

            var response = new HttpResponseMessage(HttpStatusCode.NotFound);
            _apiConfig.Endpoints["GetRegistrations"] = "v3/getRegistrations";
            HttpClient httpClient = new HttpClient(new FakeHttpMessageHandler(response))
            {
                BaseAddress = new Uri(_apiConfig.BaseUrl)
            };
            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            var telematicsDrivers = new List<TelematicsDriver>()
            {
                new TelematicsDriver()
                {
                    ParticipantExternalId = tmxId1,
                }
            };

            var registrations = new List<Registration>
            {
                new Registration()
                {
                    ParticipantExternalId = tmxId1
                }
            };

            _clientFactory.CreateClient("ModernToken").Returns(httpClient);

            var sut = new ClaimsRegistrationApi(_logger, _clientFactory, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);

            _policyDAL.GetTelematicsDriversByPolicyNumber(policyNumber).Returns(telematicsDrivers);

            var result = await sut.GetRegistrationsByPolicyNumber(policyNumber);

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Theory]
        [MemberData(nameof(MobileRegistrationsResponseData))]
        public async Task GetMobileRegistrationsTests(HttpStatusCode status, MobileRegistrationsModel registrationsResponse)
        {
            var handler = HttpUnitTestHelper.SetupMockHttpHandler(status, registrationsResponse);
            HttpClient httpClient = new HttpClient(handler.Object);
            var mockFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
            mockFactory
              .Setup(factory => factory.CreateClient("ModernToken"))
              .Returns(httpClient)
              .Verifiable();
            ClaimsRegistrationApi sut = new ClaimsRegistrationApi(_logger, mockFactory.Object, _optionsServicesConfig, _optionsEnvPrefixes, _policyDAL);

            var result = await sut.GetMobileRegistrations("MobileRegistrationCode");

            result.ShouldDeepEqual(registrationsResponse);
        }

        public static IEnumerable<object[]> MobileRegistrationsResponseData()
        {
            yield return new object[] { HttpStatusCode.OK, new MobileRegistrationsModel {
                ActiveRegistration = new RegistrationsModel
                {
                    MobileRegistrationCode = "1234567890",
                    TelematicsId = "0987654321",
                    HasCompletedRegistrationInd = true,
                    IsRegistrationEligible = false,
                    StatusSummary = "Complete",
                    ChallengeCode = "75847289",
                    ChallengeRequestCount = 1,
                    ChallengeExpirationDateTime = DateTime.Now,
                    MobileDevice = new RegistrationMobileDevice
                    {
                        MobileDeviceId = "59804871",
                        LastContactDateTime = DateTime.Now,
                        FirstContactDateTime = DateTime.Now
                    }
                },
                OtherRegistrations = new List<RegistrationsModel> {
                    new RegistrationsModel
                    {
                        MobileRegistrationCode = "5483926582",
                        TelematicsId = "TLM1234567",
                        HasCompletedRegistrationInd = false,
                        IsRegistrationEligible = true,
                        StatusSummary = "Pending",
                        ChallengeCode = "CHALL123",
                        ChallengeRequestCount = 2,
                        ChallengeExpirationDateTime = DateTime.UtcNow.AddDays(3),
                        MobileDevice = new RegistrationMobileDevice
                        {
                            MobileDeviceId = "MDVC1001",
                            LastContactDateTime = DateTime.UtcNow.AddHours(-5),
                            FirstContactDateTime = DateTime.UtcNow.AddDays(-10)
                        }
                    },
                    new RegistrationsModel
                    {
                        MobileRegistrationCode = "9874781536",
                        TelematicsId = "TLM7654321",
                        HasCompletedRegistrationInd = true,
                        IsRegistrationEligible = false,
                        StatusSummary = "Failed",
                        ChallengeCode = "CHALL999",
                        ChallengeRequestCount = 5,
                        ChallengeExpirationDateTime = DateTime.UtcNow.AddDays(1),
                        MobileDevice = new RegistrationMobileDevice
                        {
                            MobileDeviceId = "MDVC2002",
                            LastContactDateTime = DateTime.UtcNow.AddMinutes(-30),
                            FirstContactDateTime = DateTime.UtcNow.AddDays(-20)
                        }
                    }
                }
            }};
            yield return new object[] { HttpStatusCode.NotFound, null };
            yield return new object[] { HttpStatusCode.BadRequest, null };
            yield return new object[] { HttpStatusCode.InternalServerError, null };
        }

        private class FakeHttpMessageHandler : HttpMessageHandler
        {
            private readonly HttpResponseMessage _response;

            public FakeHttpMessageHandler(HttpResponseMessage response)
            {
                _response = response;
            }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, System.Threading.CancellationToken cancellationToken)
            {
                return Task.FromResult(_response);
            }
        }
    }
}
