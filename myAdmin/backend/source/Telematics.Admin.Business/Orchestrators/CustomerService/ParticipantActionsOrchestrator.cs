using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService
{
    [SingletonService]
    public interface IParticipantActionsOrchestrator
    {
        Task<ParticipantCalculatedValues> GetScoreData(int participantSeqId);
        Task<List<ParticipantCalculatedRenewalValues>> GetRenewalScoreData(int participantSeqId);
        Task UpdateParticipantGuid(string policyNumber, int participantSeqId, Guid newGuid);
        Task UpdateEnrollmentDate(string policyNumber, int participantSeqId, DateTime newEnrollmentDate);
        Task UpdateEnrollmentDate20(string policyNumber, int participantSeqId, DateTime newEnrollmentDate, DateTime? endorsementAppliedDate, bool shouldRecalculateScore);
        Task<TripSummary> GetTripSummary(string participantId, int participantSeqId, DeviceExperience experience, int algorithm, DateTime? enrollmentDate);
        Task<List<ExcludedDateRangeReasonCode>> GetExcludedDateReasonCodes();
        Task<List<ExcludedDateRange>> GetExcludedDates(string participantId);
        Task OptOut(string policyNumber, int participantSeqId);
        Task<ExcludedDateRange> AddExcludedDate(string participantId, DateTime startDate, DateTime endDate, int reasonCode, string description);
        Task UpdateExcludedDate(string participantId, DateTime startDate, DateTime endDate, int reasonCode, string description);
        Task DeleteExcludedDate(string participantId, DateTime startDate);
        Task SetToMonitoringComplete(string policyNumber, int participantSeqId, int policyPeriodSeqId);
        Task<List<OptOutSuspension>> GetOptOutSuspensions(int participantSeqId);
        Task RollbackParticipantJunction(string policyNumber, string vin = "");
        Task<int> AddOptOutSuspension(int participantSeqId, int deviceSeqId, DateTime startDate, DateTime endDate, OptOutReasonCode reason);
        Task<List<CompatibilityType>> GetCompatibilityTypes(DeviceExperience? experience = null);
        Task MergeParticipant(string policyNumber, short policySuffix, string srcParticipantId, string destParticipantId);
        Task<List<CompatibilityAction>> GetCompatibilityActions(DeviceExperience? experience = null);
        Task<bool> UpdateCompatibilityItem(CompatibilityItem compatibilityItem);
        Task<bool> AddCompatibilityItem(CompatibilityItem compatibilityItem);
        Task<InitialParticipantScoreInProcess> GetInitialScoreInProcess(int participantSeqId);
        void CancelOptOutSuspensions(List<int> optOutSeqIds);
    }

    public class ParticipantActionsOrchestrator : IParticipantActionsOrchestrator
    {
        private readonly ICommonApi commonApi;
        private readonly IPolicyApi policyApi;
        private readonly IPolicyTripApi policyTripApi;
        private readonly IDailyDrivingAggregateService aggregationService;
        private readonly IParticipantService participantService;
        private readonly IValueCalculatorService valueCalculatorService;
        private readonly IPolicyDAL policyDb;
        private readonly IMapper mapper;

        public ParticipantActionsOrchestrator(
            ICommonApi commonApi,
            IPolicyApi policyApi,
            IPolicyTripApi policyTripApi,
            IDailyDrivingAggregateService aggregationService,
            IParticipantService participantService,
            IValueCalculatorService valueCalculatorService,
            IPolicyDAL policyDAL,
            IMapper mapper)
        {
            this.commonApi = commonApi;
            this.policyApi = policyApi;
            this.policyTripApi = policyTripApi;
            this.aggregationService = aggregationService;
            this.participantService = participantService;
            this.valueCalculatorService = valueCalculatorService;
            policyDb = policyDAL;
            this.mapper = mapper;
        }

        public async Task<ParticipantCalculatedValues> GetScoreData(int participantSeqId)
        {
            var scoringData = await policyDb.GetParticipantScoringData(participantSeqId);
            var valueData = await valueCalculatorService.GetCalculatedValues(participantSeqId);
            var model = mapper.Map<ParticipantCalculatedValues>(valueData);
            model.ScoringDetails = scoringData;
            return model;
        }

        public async Task<List<ParticipantCalculatedRenewalValues>> GetRenewalScoreData(int participantSeqId)
        {
            var data = await participantService.GetCalculatedRenewalValues(participantSeqId);
            var model = mapper.Map<List<ParticipantCalculatedRenewalValues>>(data.RenewalScores);
            return model;
        }

        public async Task UpdateParticipantGuid(string policyNumber, int participantSeqId, Guid newGuid)
        {
            await participantService.UpdateGuid(policyNumber, participantSeqId, newGuid);
        }

        public async Task UpdateEnrollmentDate(string policyNumber, int participantSeqId, DateTime newEnrollmentDate)
        {
            await participantService.ResetEnrollmentDate(policyNumber, participantSeqId, newEnrollmentDate);
        }

        public async Task UpdateEnrollmentDate20(string policyNumber, int participantSeqId, DateTime newEnrollmentDate, DateTime? endorsementAppliedDate, bool shouldRecalculateScore)
        {
            await participantService.ResetEnrollmentDate20(
                policyNumber,
                participantSeqId,
                newEnrollmentDate,
                isScoreCalculated: !shouldRecalculateScore,
                isEmailSent: !shouldRecalculateScore,
                endorsementAppliedDateTime: shouldRecalculateScore ? (DateTime?)null : endorsementAppliedDate ?? DateTime.Now);
        }

        public async Task<TripSummary> GetTripSummary(string participantId, int participantSeqId, DeviceExperience experience, int algorithm, DateTime? enrollmentDate)
        {
            if (algorithm == 1 || (experience == DeviceExperience.Device && (algorithm == 3 || algorithm == 4)))
            {
                return await getTripSummary2008(participantSeqId, experience, enrollmentDate);
            }

            return await getTripSummary(participantId, participantSeqId, experience, enrollmentDate);
        }

        private async Task<TripSummary> getTripSummary(string participantId, int participantSeqId, DeviceExperience experience, DateTime? enrollmentDate = null)
        {
            var data = await policyTripApi.GetTripStats(participantId, enrollmentDate ?? DateTime.Now.AddYears(-1), DateTime.Now);
            var tripData = mapper.Map<IEnumerable<TripSummaryDaily>>(data?.DailyTotals);
            return await getTripSummary(participantSeqId, experience, tripData);
        }

        private async Task<TripSummary> getTripSummary2008(int participantSeqId, DeviceExperience experience, DateTime? enrollmentDate = null)
        {
            var data = await policyDb.GetTripStats2008(participantSeqId, enrollmentDate ?? DateTime.Now.AddYears(-1), DateTime.Now);
            return await getTripSummary(participantSeqId, experience, data);
        }

        async Task<TripSummary> getTripSummary(int participantSeqId, DeviceExperience experience, IEnumerable<TripSummaryDaily> tripData)
        {
            if (experience == DeviceExperience.OEM)
                return new TripSummary { Trips = tripData };

            dynamic scoreData = await valueCalculatorService.GetCalculatedValues(participantSeqId);

            if (scoreData != null)
            {
                var model = new TripSummary { Trips = tripData };
                var adjConnTime = scoreData.Connectivity != null ? new TimeSpan(0, 0, scoreData.Connectivity.ConnectedSeconds) : new TimeSpan();

                model.AddExtender("AnnualizedTotalDays", Convert.ToDecimal(adjConnTime.TotalDays));
                if (scoreData.Score.GetType().GetProperty("TripRegularity") != null)
                {
                    model.AddExtender("TripRegularity", (int)(scoreData.Score.TripRegularity ?? 0));
                }
                else
                {
                    model.AddExtender("TripRegularity", 0);
                }

                return model;
            }

            return null;
        }

        public async Task<List<ExcludedDateRangeReasonCode>> GetExcludedDateReasonCodes()
        {
            var model = await policyApi.GetExcludedDateReasonCodes();
            return model.OrderBy(x => x.Description).ToList();
        }

        public async Task<List<ExcludedDateRange>> GetExcludedDates(string participantId)
        {
            var model = await policyDb.GetExcludedDateRanges(participantId);
            return model;
        }

        public async Task<ExcludedDateRange> AddExcludedDate(string participantId, DateTime startDate, DateTime endDate, int reasonCode, string description)
        {
            await policyApi.AddExcludedDate(participantId, startDate, endDate, reasonCode, description);
            var dates = await GetExcludedDates(participantId);
            return dates.OrderByDescending(x => x.LastChangeDateTime).First();
        }

        public async Task UpdateExcludedDate(string participantId, DateTime startDate, DateTime endDate, int reasonCode, string description)
        {
            await policyApi.UpdateExcludedDate(participantId, startDate, endDate, reasonCode, description);
        }

        public async Task DeleteExcludedDate(string participantId, DateTime date)
        {
            await policyApi.DeleteExcludedDate(participantId, date);
        }

        public async Task<List<OptOutSuspension>> GetOptOutSuspensions(int participantSeqId)
        {
            var data = await participantService.GetOptOutSuspensions(participantSeqId);
            var model = mapper.Map<List<OptOutSuspension>>(data.OptOutSuspension);
            return model;
        }

        public async Task<int> AddOptOutSuspension(int participantSeqId, int deviceSeqId, DateTime startDate, DateTime endDate, OptOutReasonCode reason)
        {
            var data = await participantService.AddOptOutSuspension(participantSeqId, deviceSeqId, startDate, endDate, reason);
            return data.OptOutSuspensionSeqID;
        }

        public void CancelOptOutSuspensions(List<int> optOutSeqIds)
        {
            optOutSeqIds.ToList().ForEach(async (x) => await participantService.CancelOptOutSuspension(x));
        }

        public async Task SetToMonitoringComplete(string policyNumber, int participantSeqId, int policyPeriodSeqId)
        {
            await participantService.SetToMonitoringComplete(policyNumber, participantSeqId, policyPeriodSeqId);
        }

        public async Task OptOut(string policyNumber, int participantSeqId)
        {
            await participantService.OptOut(policyNumber, participantSeqId);
        }

        public async Task RollbackParticipantJunction(string policyNumber, string vin = "")
        {
            await participantService.RollbackParticipantJunction(policyNumber, vin);
        }

        public async Task<List<CompatibilityType>> GetCompatibilityTypes(DeviceExperience? experience = null)
        {
            var data = await commonApi.GetCompatibilityTypes();
            var model = data.Values;
            if (experience == null)
                return model.ToList();
            else
                return (experience == DeviceExperience.Mobile ? model.Where(x => x.DeviceExperienceTypeCode == DeviceExperience.Mobile) :
                    model.Where(x => x.DeviceExperienceTypeCode != DeviceExperience.Mobile)).ToList();
        }

        public async Task<List<CompatibilityAction>> GetCompatibilityActions(DeviceExperience? experience = null)
        {
            var data = await commonApi.GetCompatibilityActions();
            var model = data.Values;
            if (experience == null)
                return model.ToList();
            else
                return (experience == DeviceExperience.Mobile ? model.Where(x => x.DeviceExperienceTypeCode == DeviceExperience.Mobile) :
                model.Where(x => x.DeviceExperienceTypeCode != DeviceExperience.Mobile)).ToList();
        }

        public async Task<bool> UpdateCompatibilityItem(CompatibilityItem compatibilityItem)
        {
            return await commonApi.UpdateCompatibilityItem(compatibilityItem);
        }

        public async Task<bool> AddCompatibilityItem(CompatibilityItem compatibilityItem)
        {
            return await commonApi.AddCompatibilityItem(compatibilityItem);
        }

        public async Task MergeParticipant(string policyNumber, short policySuffix, string srcParticipantId, string destParticipantId)
        {
            await policyApi.MergeParticipant(policyNumber, policySuffix, srcParticipantId, destParticipantId);
        }

        public async Task<InitialParticipantScoreInProcess> GetInitialScoreInProcess(int participantSeqId)
        {
            return await policyDb.GetInitialScoreInProcess(participantSeqId);
        }
    }
}
