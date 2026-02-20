using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.CustomerService
{
    public class ParticipantActionsOrchestratorTests : TestBase<ParticipantActionsOrchestrator, IParticipantActionsOrchestrator>
    {
        public ParticipantActionsOrchestratorTests()
        {
            Orchestrator = new ParticipantActionsOrchestrator(Apis.Common.Object, Apis.Policy.Object, Apis.PolicyTrip.Object, Services.DailyDrivingAggregate.Object, Services.Participant.Object, Services.ValueCalculator.Object, Databases.Policy.Object, Mapper);
        }

        [Fact]
        public async Task GetScoreData_Tests()
        {
            var participantSeqId = 123;

            Databases.Policy.Setup(x => x.GetParticipantScoringData(participantSeqId)).ReturnsAsync(new ParticipantScoringData { MobileCalculator = MobileValueCalculatorType.Calculator2020WithoutDistractedDriving });
            Services.ValueCalculator.Setup(x => x.GetCalculatedValues(participantSeqId)).ReturnsAsync(new WcfValueCalculator.GetValueCalculatorValuesResponse());

            var model = await Orchestrator.GetScoreData(participantSeqId);

            VerifyAllServices();
            Assert.Equal(MobileValueCalculatorType.Calculator2020WithoutDistractedDriving, model.ScoringDetails.MobileCalculator);
        }

        [Fact]
        public async Task GetRenewalScoreData_Tests()
        {
            var participantSeqId = 123;

            Services.Participant.Setup(x => x.GetCalculatedRenewalValues(participantSeqId)).ReturnsAsync(new WcfParticipantService.GetRenewalScoreHistoryResponse());

            await Orchestrator.GetRenewalScoreData(participantSeqId);

            Services.Participant.VerifyAll();
        }

        [Fact]
        public async Task UpdateParticipantGuid_Tests()
        {
            var policyNumber = "123";
            var participantSeqId = 123;
            var guid = Guid.NewGuid();

            Services.Participant.Setup(x => x.UpdateGuid(policyNumber, participantSeqId, guid)).ReturnsAsync(new WcfParticipantService.UpdateParticipantTableResponse());

            await Orchestrator.UpdateParticipantGuid(policyNumber, participantSeqId, guid);

            Services.Participant.VerifyAll();
        }

        [Fact]
        public async Task MergeParticipant_Tests()
        {
            var policyNumber = "123";
            short policySuffix = 0;
            string p1id = Guid.NewGuid().ToString(), p2id = Guid.NewGuid().ToString();

            Apis.Policy.Setup(x => x.MergeParticipant(policyNumber, policySuffix, p1id, p2id));

            await Orchestrator.MergeParticipant(policyNumber, policySuffix, p1id, p2id);

            Apis.Policy.VerifyAll();
        }

        public static readonly object[][] TripSummaryTestData =
        {
            new object[] { DeviceExperience.Device, 1, new DateTime(1980,4,16) },
            new object[] { DeviceExperience.Device, 3, null },
            new object[] { DeviceExperience.Device, 4, null },
            new object[] { DeviceExperience.Device, 2, null },
            new object[] { DeviceExperience.Device, 5, null },
            new object[] { DeviceExperience.Device, 6, null },
            new object[] { DeviceExperience.Device, 7, null },
            new object[] { DeviceExperience.Device, 8, null },
            new object[] { DeviceExperience.Mobile, 1, null },
            new object[] { DeviceExperience.Mobile, 8, null },
            new object[] { DeviceExperience.OEM, 1, null },
            new object[] { DeviceExperience.OEM, 8, null }
        };

        [Theory, MemberData(nameof(TripSummaryTestData))]
        public async Task GetTripSummary_Tests(DeviceExperience experience, int algorithm, DateTime? enrollmentDate)
        {
            string participantId = Guid.NewGuid().ToString();
            int participantSeqId = 1234;

            if (algorithm == 1 || (experience == DeviceExperience.Device && (algorithm == 3 || algorithm == 4)))
            {
                Databases.Policy.Setup(x => x.GetTripStats2008(participantSeqId, It.Is<DateTime>(x => x.Date == (enrollmentDate ?? DateTime.Now.AddYears(-1)).Date), It.Is<DateTime>(x => x.Date == DateTime.Now.Date))).ReturnsAsync(new List<TripSummaryDaily>());
            }
            else
            {
                Apis.PolicyTrip.Setup(x => x.GetTripStats(participantId, It.Is<DateTime>(x => x.Date == (enrollmentDate ?? DateTime.Now.AddYears(-1)).Date), It.Is<DateTime>(x => x.Date == DateTime.Now.Date))).ReturnsAsync(new Admin.Services.Models.TripStatsGetResponse { });
            }

            if (experience != DeviceExperience.OEM)
                Services.ValueCalculator.Setup(x => x.GetCalculatedValues(participantSeqId));

            await Orchestrator.GetTripSummary(participantId, participantSeqId, experience, algorithm, enrollmentDate);

            VerifyAllServices();
        }

        [Fact]
        public async Task GetExcludedDateRange_Tests()
        {
            var guid = Guid.NewGuid().ToString();

            Databases.Policy.Setup(x => x.GetExcludedDateRanges(guid)).ReturnsAsync(new List<ExcludedDateRange> {
                new ExcludedDateRange { Description = "Oldest", LastChangeDateTime = DateTime.Now.AddDays(-1) },
                new ExcludedDateRange { Description = "Newest", LastChangeDateTime = DateTime.Now }
            });

            var dates = await Orchestrator.GetExcludedDates(guid);

            Databases.Policy.VerifyAll();
            Assert.Equal(2, dates.Count());
        }

        [Fact]
        public async Task AddExcludedDateRange_Tests()
        {
            var guid = Guid.NewGuid().ToString();
            var reasonCode = 0;
            var description = "description";

            Apis.Policy.Setup(x => x.AddExcludedDate(guid, It.IsAny<DateTime>(), It.IsAny<DateTime>(), reasonCode, description));
            Databases.Policy.Setup(x => x.GetExcludedDateRanges(guid)).ReturnsAsync(new List<ExcludedDateRange> {
                new ExcludedDateRange { Description = "Oldest", LastChangeDateTime = DateTime.Now.AddDays(-1) },
                new ExcludedDateRange { Description = "Newest", LastChangeDateTime = DateTime.Now }
            });

            var date = await Orchestrator.AddExcludedDate(guid, DateTime.Now, DateTime.Now, reasonCode, description);

            VerifyAllServices();
            Assert.Equal("Newest", date.Description);
        }

        [Theory]
        [InlineData("")]
        [InlineData("some description")]
        public async Task UpdateExcludedDateRange_Tests(string description)
        {
            var guid = Guid.NewGuid().ToString();
            var reasonCode = 0;

            Apis.Policy.Setup(x => x.UpdateExcludedDate(guid, It.IsAny<DateTime>(), It.IsAny<DateTime>(), reasonCode, description));

            await Orchestrator.UpdateExcludedDate(guid, DateTime.Now, DateTime.Now, reasonCode, description);

            Apis.Policy.VerifyAll();
        }

        [Fact]
        public async Task DeleteExcludedDateRange_Tests()
        {
            var guid = Guid.NewGuid().ToString();

            Apis.Policy.Setup(x => x.DeleteExcludedDate(guid, It.IsAny<DateTime>()));

            await Orchestrator.DeleteExcludedDate(guid, DateTime.Now);

            Apis.Policy.VerifyAll();
        }

        public static readonly object[][] UpateEnrollmentDateTestData =
        {
            new object[] { ProgramType.PriceModel2, true, null },
            new object[] { ProgramType.PriceModel2, false, new DateTime(2021, 7, 7) },
            new object[] { ProgramType.PriceModel2, false, null },
            new object[] { ProgramType.PriceModel3, null, null },
            new object[] { ProgramType.PriceModel4, null, null }
        };

        [Theory, MemberData(nameof(UpateEnrollmentDateTestData))]
        public async Task UpateEnrollmentDate_Tests(ProgramType program, bool? shouldRecalculate, DateTime? endorsementAppliedDate)
        {
            var policyNumber = "123";
            var partSeqId = 123;
            var newEnrollmentDate = DateTime.Now;

            if (program == ProgramType.PriceModel2)
            {
                Services.Participant.Setup(x => x.ResetEnrollmentDate20(policyNumber, partSeqId, newEnrollmentDate, It.Is<DateTime?>(x =>
                    (shouldRecalculate ?? false) ? x == null : (endorsementAppliedDate != null ? x == endorsementAppliedDate : x.Value.Date == DateTime.Now.Date)
                ), null, !shouldRecalculate.Value, !shouldRecalculate.Value, true, "")).ReturnsAsync(new WcfParticipantService.ResetEnrollmentInitialParticipationScoreInProcessResponse());
                await Orchestrator.UpdateEnrollmentDate20(policyNumber, partSeqId, newEnrollmentDate, endorsementAppliedDate, shouldRecalculate.Value);
            }
            else
            {
                Services.Participant.Setup(x => x.ResetEnrollmentDate(policyNumber, partSeqId, newEnrollmentDate, false, "")).ReturnsAsync(new WcfParticipantService.ResetEnrollmentInitialParticipationScoreInProcessResponse());
                await Orchestrator.UpdateEnrollmentDate(policyNumber, partSeqId, newEnrollmentDate);
            }

            Services.Participant.VerifyAll();
        }


        [Fact]
        public void CancelOptOutSuspensions_Test()
        {
            Services.Participant.Setup(x => x.CancelOptOutSuspension(It.IsAny<int>()));

            Orchestrator.CancelOptOutSuspensions(new List<int>() { 1, 3, 4 });

            Services.Participant.VerifyAll();
        }

        [Fact]
        public void AddOptOutSuspension_Test()
        {
            Services.Participant.Setup(x => x.AddOptOutSuspension(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<OptOutReasonCode>()));

            Orchestrator.AddOptOutSuspension(1, 1, new DateTime(), new DateTime(), OptOutReasonCode.NonInstaller);

            Services.Participant.VerifyAll();
        }

        [Fact]
        public void GetOptOutSuspensions_Test()
        {
            Services.Participant.Setup(x => x.GetOptOutSuspensions(It.IsAny<int>()));

            Orchestrator.GetOptOutSuspensions(1);

            Services.Participant.VerifyAll();
        }

        [Fact]
        public void GetCompatibilityTypes_Test()
        {
            Apis.Common.Setup(x => x.GetCompatibilityTypes());

            Orchestrator.GetCompatibilityTypes(DeviceExperience.Mobile);

            Apis.Common.VerifyAll();
        }

        [Fact]
        public void GetCompatibilityActions_Test()
        {
            Apis.Common.Setup(x => x.GetCompatibilityActions());

            Orchestrator.GetCompatibilityActions(DeviceExperience.Device);

            Apis.Common.VerifyAll();
        }

        [Fact]
        public void UpdateCompatibilityItem_Test()
        {
            CompatibilityItem item = new CompatibilityItem();

            Apis.Common.Setup(x => x.UpdateCompatibilityItem(item));

            Orchestrator.UpdateCompatibilityItem(item);

            Apis.Common.VerifyAll();
        }

        [Fact]
        public void AddCompatibilityItem_Test()
        {
            CompatibilityItem item = new CompatibilityItem();

            Apis.Common.Setup(x => x.AddCompatibilityItem(item));

            Orchestrator.AddCompatibilityItem(item);

            Apis.Common.VerifyAll();
        }
    }
}
