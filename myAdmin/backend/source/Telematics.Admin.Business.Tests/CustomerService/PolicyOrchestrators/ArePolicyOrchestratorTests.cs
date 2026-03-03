using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeepEqual.Syntax;
using Moq;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Services.Models.ClaimsRegistrationApi;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.CustomerService.PolicyOrchestrators
{
    public class ArePolicyOrchestratorTests : TestBase<ArePolicyOrchestrator, IArePolicyOrchestrator>
    {
        const string mobileRegCode = "currentCode";


        public ArePolicyOrchestratorTests() : base()
        {
            Orchestrator = new ArePolicyOrchestrator(Apis.ClaimsParticipantManagement.Object, Apis.HomebaseParticipantManagement.Object, Apis.PolicyDevice.Object, Apis.ClaimsRegistration.Object, Apis.PolicyServicing.Object, Mapper, Logger.Object);
        }

        public static IEnumerable<object[]> GetPolicySummaryTestData()
        {
            yield return new object[] { "PolicyNumber", Guid.NewGuid().ToString(), false, false, false, false, null };
            yield return new object[] { "PolicyNumber2", Guid.NewGuid().ToString(), true, false, false, false, null };
            yield return new object[] { "PolicyNumber3", Guid.NewGuid().ToString(), true, true, false, false, null };
            yield return new object[] { "PolicyNumber4", Guid.NewGuid().ToString(), true, true, true, false, null };
            yield return new object[] { "PolicyNumber5", Guid.NewGuid().ToString(), true, true, true, true, null };
            yield return new object[] { "PolicyNumber6", Guid.NewGuid().ToString(), true, true, true, true, true };
        }

        [Theory]
        [MemberData(nameof(GetPolicySummaryTestData))]
        public async Task GetPolicySummary_PolicyFound_MappingTests(string policyNumber, string telematicsId, bool adEnrolled, bool adActivated, bool snapshotEnrolled, bool snapshotActivated, bool? cadExperience)
        {
            var now = DateTime.Now;
            Apis.ClaimsParticipantManagement.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(
                new ClaimsPolicySummaryResponse
                {
                    PolicyNumber = policyNumber,
                    ParticipantSummaries = new List<ClaimsParticipantSummaryResponse>
                        {
                            new ClaimsParticipantSummaryResponse
                            {
                                TelematicsId = telematicsId,
                                IsAccidentResponseActivated = adActivated,
                                IsAccidentResponseEnrolled = adEnrolled,
                                AccidentResponseActivationDateTime = now,
                                EnrollmentDateTime = now,
                                AccidentResponseConsentDateTime = now,
                                LastContactDateTime = now,
                                UnenrollmentDateTime = now,
                                UnenrollReason = UnenrollReason.ExpireNonPay,
                                DriverReferenceId = "1"
                            }
                        }
                });

            Apis.HomebaseParticipantManagement.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(
                new HomebasePolicySummaryResponse
                {
                    Policy = policyNumber,
                    Participants = new List<HomebaseParticipantSummaryResponse>
                    {
                        new HomebaseParticipantSummaryResponse
                        {
                            TelematicsId = telematicsId,
                            ADActivated = adActivated,
                            ADEnrolled = adEnrolled,
                            UBIActivated = snapshotActivated,
                            UBIEnrolled = snapshotEnrolled,
                            CADExperience = cadExperience,
                            DriverReferenceId = "1"
                        }
                    }
                });

            Apis.HomebaseParticipantManagement.Setup(x => x.GetParticipantMobileDevice(telematicsId)).ReturnsAsync(
                new HomebaseParticipantMobileDeviceResponse
                {
                    MobileAppVersionName = "MobileAppVersionName",
                    MobileDeviceModelName = "MobileDeviceModelName",
                    MobileOSName = "MobileOSName",
                    MobileOSVersionName = "MobileOSVersionName",
                    TelematicsId = telematicsId
                });

            Apis.PolicyServicing.Setup(x => x.GetPolicy(policyNumber)).ReturnsAsync(new PolicyServicingPolicy
            {
                CorePolicyDetails = new CorePolicyDetails
                {
                    Drivers = new PolicyServicingDriver[]
                    {
                        new PolicyServicingDriver
                        {
                            DriverId = "1",
                            FirstName = "FirstName"
                        }
                    }
                }
            });

            var expectedModel = new Policy
            {
                PolicyNumber = policyNumber,
                AreDetails = new ArePolicyDetails { ExperienceType = cadExperience.HasValue ? AreExperience.CAD : AreExperience.ARE },
                Participants = new List<Participant>
                {
                    new Participant {
                        TelematicsId = telematicsId,
                        AreDetails = new AreParticipantDetails
                        {
                            ADActivated = adActivated,
                            ADEnrolled = adEnrolled,
                            UBIActivated = snapshotActivated,
                            UBIEnrolled = snapshotEnrolled,
                            CADExperience = cadExperience,
                            EnrollmentDateTime = now,
                            AccidentResponseActivationDateTime = now,
                            AccidentResponseConsentDateTime = now,
                            LastContactDateTime = now,
                            UnenrollmentDateTime = now,
                            UnenrollReason = UnenrollReason.ExpireNonPay,
                            DriverFirstName = "FirstName",
                            DriverReferenceId = "1"
                        },
                        MobileDeviceDetails = new MobileDevice()
                        {
                            MobileAppVersionName = "MobileAppVersionName",
                            MobileDeviceModelName = "MobileDeviceModelName",
                            MobileOSName = "MobileOSName",
                            MobileOSVersionName = "MobileOSVersionName",
                        }
                    }
                }
            };

            var model = await Orchestrator.GetPolicySummary(policyNumber);

            model.ShouldDeepEqual(expectedModel);
            VerifyAllServices();
        }

        [Theory]
        [MemberData(nameof(GetPolicySummaryTestData))]
        public async Task GetPolicySummary_PolicyFound_MappingTests_PSPolicyApiNotFound(string policyNumber, string telematicsId, bool adEnrolled, bool adActivated, bool snapshotEnrolled, bool snapshotActivated, bool? cadExperience)
        {
            var now = DateTime.Now;
            Apis.ClaimsParticipantManagement.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(
                new ClaimsPolicySummaryResponse
                {
                    PolicyNumber = policyNumber,
                    ParticipantSummaries = new List<ClaimsParticipantSummaryResponse>
                        {
                            new ClaimsParticipantSummaryResponse
                            {
                                TelematicsId = telematicsId,
                                IsAccidentResponseActivated = adActivated,
                                IsAccidentResponseEnrolled = adEnrolled,
                                AccidentResponseActivationDateTime = now,
                                EnrollmentDateTime = now,
                                AccidentResponseConsentDateTime = now,
                                LastContactDateTime = now,
                                UnenrollmentDateTime = now,
                                UnenrollReason = UnenrollReason.ExpireNonPay,
                            }
                        }
                });

            Apis.HomebaseParticipantManagement.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(
                new HomebasePolicySummaryResponse
                {
                    Policy = policyNumber,
                    Participants = new List<HomebaseParticipantSummaryResponse>
                    {
                        new HomebaseParticipantSummaryResponse
                        {
                            TelematicsId = telematicsId,
                            ADActivated = adActivated,
                            ADEnrolled = adEnrolled,
                            UBIActivated = snapshotActivated,
                            UBIEnrolled = snapshotEnrolled,
                            CADExperience = cadExperience,
                        }
                    }
                });

            Apis.HomebaseParticipantManagement.Setup(x => x.GetParticipantMobileDevice(telematicsId)).ReturnsAsync(
                new HomebaseParticipantMobileDeviceResponse
                {
                    MobileAppVersionName = "MobileAppVersionName",
                    MobileDeviceModelName = "MobileDeviceModelName",
                    MobileOSName = "MobileOSName",
                    MobileOSVersionName = "MobileOSVersionName",
                    TelematicsId = telematicsId
                });

            Apis.PolicyServicing.Setup(x => x.GetPolicy(policyNumber)).ReturnsAsync(() => null);

            var expectedModel = new Policy
            {
                PolicyNumber = policyNumber,
                AreDetails =
                    new ArePolicyDetails
                    {
                        ExperienceType = cadExperience.HasValue ? AreExperience.CAD : AreExperience.ARE
                    },
                Participants = new List<Participant>
                {
                    new Participant
                    {
                        TelematicsId = telematicsId,
                        AreDetails = new AreParticipantDetails
                        {
                            ADActivated = adActivated,
                            ADEnrolled = adEnrolled,
                            UBIActivated = snapshotActivated,
                            UBIEnrolled = snapshotEnrolled,
                            CADExperience = cadExperience,
                            EnrollmentDateTime = now,
                            AccidentResponseActivationDateTime = now,
                            AccidentResponseConsentDateTime = now,
                            LastContactDateTime = now,
                            UnenrollmentDateTime = now,
                            UnenrollReason = UnenrollReason.ExpireNonPay
                        },
                        MobileDeviceDetails = new MobileDevice()
                        {
                            MobileAppVersionName = "MobileAppVersionName",
                            MobileDeviceModelName = "MobileDeviceModelName",
                            MobileOSName = "MobileOSName",
                            MobileOSVersionName = "MobileOSVersionName"
                        }
                    }
                }
            };

            var model = await Orchestrator.GetPolicySummary(policyNumber);

            model.ShouldDeepEqual(expectedModel);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetPolicySummary_PolicyNotFoundTest()
        {
            var model = await Orchestrator.GetPolicySummary(It.IsAny<string>());
            Assert.Null(model);
        }

        [Fact]
        public async Task GetArePoliciesByMobileRegistrations_SinglePolicyTest()
        {
            var telematicsId = Guid.NewGuid().ToString();
            var policyNumber = "PolicyNumber";
            var now = DateTime.Now;

            var mobileRegistrations = new MobileRegistrationsModel
            {
                ActiveRegistration = new RegistrationsModel
                {
                    TelematicsId = telematicsId,
                    StatusSummary = "Complete"
                }
            }.GetAllRegistrations();

            Apis.ClaimsParticipantManagement.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(
                new ClaimsPolicySummaryResponse
                {
                    PolicyNumber = policyNumber,
                    ParticipantSummaries = new List<ClaimsParticipantSummaryResponse>
                        {
                            new ClaimsParticipantSummaryResponse
                            {
                                TelematicsId = telematicsId,
                                EnrollmentDateTime = now
                            }
                        }
                });

            Apis.ClaimsParticipantManagement.Setup(x => x.GetParticipantSummary(telematicsId)).ReturnsAsync(
                new ClaimsParticipantSummaryResponse
                {
                    TelematicsId = telematicsId,
                    PolicyNumber = policyNumber
                });

            Apis.HomebaseParticipantManagement.Setup(x => x.GetParticipantMobileDevice(telematicsId)).ReturnsAsync(
                new HomebaseParticipantMobileDeviceResponse
                {
                    MobileAppVersionName = "MobileAppVersionName",
                    MobileDeviceModelName = "MobileDeviceModelName",
                    MobileOSName = "MobileOSName",
                    MobileOSVersionName = "MobileOSVersionName",
                    TelematicsId = telematicsId
                });

            Apis.PolicyServicing.Setup(x => x.GetPolicy(policyNumber)).ReturnsAsync(new PolicyServicingPolicy
            {
                CorePolicyDetails = new CorePolicyDetails
                {
                    Drivers = new PolicyServicingDriver[]
        {
                        new PolicyServicingDriver
                        {
                            DriverId = "1",
                            FirstName = "FirstName"
                        }
        }
                }
            });

            var expectedModel = new List<Policy> {
                new Policy {
                    PolicyNumber = policyNumber,
                    AreDetails = new ArePolicyDetails { ExperienceType = AreExperience.ARE },
                    Participants = new List<Participant>
                    {
                        new Participant
                        {
                            TelematicsId = telematicsId,
                            AreDetails = new AreParticipantDetails { EnrollmentDateTime = now },
                            MobileDeviceDetails = new MobileDevice()
                            {
                                MobileAppVersionName = "MobileAppVersionName",
                                MobileDeviceModelName = "MobileDeviceModelName",
                                MobileOSName = "MobileOSName",
                                MobileOSVersionName = "MobileOSVersionName"
                            }

                        }
                    }
                }
            };

            var model = await Orchestrator.GetArePoliciesByMobileRegistrations(mobileRegistrations);

            model.ShouldDeepEqual(expectedModel);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetArePoliciesByMobileRegistrations_MultiPolicyTest()
        {
            var numberOfTmxIds = 3;
            var random = new Random();
            var policyNumber = "PolicyNumber";

            var telematicsIds = new List<string>();
            var registrations = new List<RegistrationsModel>();
            var mobileRegistrations = new MobileRegistrationsModel();
            for (int i = 0; i < numberOfTmxIds; i++)
            {
                var id = Guid.NewGuid().ToString();
                telematicsIds.Add(id);

                StatusSummary regStatus;
                if (i == 0)
                {
                    regStatus = StatusSummary.New;
                }
                else
                {
                    regStatus = StatusSummary.Inactive;
                }

                var registration = new RegistrationsModel
                {
                    TelematicsId = id,
                    StatusSummary = regStatus.ToString()
                };
                registrations.Add(registration);

                if (i == 0)
                {
                    mobileRegistrations.ActiveRegistration = registration;
                }
                else
                {
                    var currentOtherRegistrations = mobileRegistrations.OtherRegistrations?.ToList() ?? new List<RegistrationsModel>();
                    currentOtherRegistrations.Add(registration);
                    mobileRegistrations.OtherRegistrations = currentOtherRegistrations;
                }
            }
            
            telematicsIds.ForEach(x =>
            {
                Apis.ClaimsParticipantManagement.Setup(y => y.GetParticipantSummary(x)).ReturnsAsync(() => null);
                Apis.HomebaseParticipantManagement.Setup(y => y.GetParticipantSummary(x)).ReturnsAsync(new HomebaseParticipantSummaryResponse { TelematicsId = x, PolicyNumber = $"{policyNumber}{telematicsIds.IndexOf(x)}", ADEnrolled = true });
            });

            var expectedModel = new List<Policy>();
            for (int j = 0; j < numberOfTmxIds; j++)
            {
                var policy = new Policy { PolicyNumber = $"{policyNumber}{j}" };
                policy.AddExtender("StatusSummary", registrations[j].StatusSummary);
                expectedModel.Add(policy);
            }

            var model = await Orchestrator.GetArePoliciesByMobileRegistrations(mobileRegistrations.GetAllRegistrations());

            model.ShouldDeepEqual(expectedModel);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetArePoliciesByMobileRegistrations_PolicyNotFoundTest()
        {
            var model = await Orchestrator.GetArePoliciesByMobileRegistrations(null);
            Assert.Null(model);
            VerifyAllServices();
        }
    }
}
