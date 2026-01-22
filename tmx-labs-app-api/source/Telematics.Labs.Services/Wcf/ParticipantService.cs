using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfParticipantService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IParticipantService
    {
        Task<SwitchMobileToOBDResponse> SwitchToOBD(string policyNumber, int participantSeqId);
        Task<UpdateParticipantTableResponse> UpdateGuid(string policyNumber, int participantSeqId, Guid participantId);
        Task<ResetEnrollmentInitialParticipationScoreInProcessResponse> ResetEnrollmentDate(
            string policyNumber,
            int participantSeqId,
            DateTime enrollmentDate,
            bool resetInitialScoreInProcess = false,
            string slot = "");
        Task<ResetEnrollmentInitialParticipationScoreInProcessResponse> ResetEnrollmentDate20(
            string policyNumber,
            int participantSeqId,
            DateTime enrollmentDate,
            DateTime? endorsementAppliedDateTime = null,
            bool? isEndorsementDiscountZero = null,
            bool isScoreCalculated = false,
            bool isEmailSent = false,
            bool resetInitialScoreInProcess = true,
            string slot = "");
        Task<GetRenewalScoreHistoryResponse> GetCalculatedRenewalValues(int participantSeqId);
        Task<SwapMobileDriversResponse> SwapDriver(string policyNumber, int srcParticipantSeqId, int destParticipantSeqId);
        Task<OptOutSuspensionResponse> GetOptOutSuspensions(int participantSeqId);
        Task<InsertOptOutSuspensionResponse> AddOptOutSuspension(int participantSeqId, int deviceSeqId, DateTime startDate, DateTime endDate, OptOutReasonCode reason);
        Task<SetMonitoringCompleteResponse> SetToMonitoringComplete(string policyNumber, int participantSeqId, int policyPeriodSeqId);
        Task<OptOutResponse> OptOut(string policyNumber, int participantSeqId);
        Task<RollbackPJResponse> RollbackParticipantJunction(string policyNumber, string vin = "");
        Task<GetDeviceEventsResponse> GetConnectionTimeline(int participantSeqId);
        Task<GetDeviceRecoverySuspensionResponse> GetDeviceHistory(int participantSeqId);
        Task<SetDeviceRecoverySuspensionResponse> UpdateSuspensionInfo(IEnumerable<int> deviceSeqId);
        Task<GetInitialParticipationInfoResponse> GetInitialParticipationInfo(int participantSeqId);
        Task<InsertInitialParticipationScoreInProcessResponse> AddInitialParticipantDiscountRecord(string policyNumber, int participantSeqId);
        Task<UpdateOptOutSuspensionResponse> CancelOptOutSuspension(int optOutSeqId);
    }

    public class ParticipantService : WcfService<ParticipantServiceClient>, IParticipantService
    {
        private readonly IHttpContextAccessor contextAccessor;

        public ParticipantService(ILogger<ParticipantService> logger, IWcfServiceFactory factory, IHttpContextAccessor contextAccessor)
            : base(logger, factory.CreateParticipantClient)
        {
            this.contextAccessor = contextAccessor;
        }

        public async Task<SwitchMobileToOBDResponse> SwitchToOBD(string policyNumber, int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.SwitchMobileToOBDAsync(new SwitchMobileToOBDRequest
            {
                PolicyNumber = policyNumber,
                ParticipantSeqId = participantSeqId,
                UserName = contextAccessor.CurrentUser()
            }), logger, new Dictionary<ResponseStatus, string>
            {
                [ResponseStatus.Default] = "Failed to Switch Mobile to Plug-in",
                [ResponseStatus.FailureWithWarning] = "Vehicle is not eligible for a Plug-in device"
            });
            return response ?? new SwitchMobileToOBDResponse
            {
                ResponseStatus = WcfParticipantService.ResponseStatus.Failure,
                ResponseErrors = new WcfParticipantService.ResponseError[] { new WcfParticipantService.ResponseError {
                    Message= "Failed to Switch Mobile to Plug-in"
                }
                }
            };
        }

        public async Task<UpdateParticipantTableResponse> UpdateGuid(string policyNumber, int participantSeqId, Guid participantId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.UpdateParticipantTableAsync(new UpdateParticipantTableRequest
            {
                PolicyNumber = policyNumber,
                ParticipantID = participantId.ToString(),
                ParticipantSeqID = participantSeqId,
                UserName = contextAccessor.CurrentUser()
            }), logger, "This Guid is already in use.");

            return response;
        }

        public async Task<ResetEnrollmentInitialParticipationScoreInProcessResponse> ResetEnrollmentDate(
            string policyNumber,
            int participantSeqId,
            DateTime enrollmentDate,
            bool resetInitialScoreInProcess = false,
            string slot = "")
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.ResetEnrollmentInitialParticipationScoreInProcessAsync(new ResetEnrollmentInitialParticipationScoreInProcessRequest
            {
                PolicyNumber = policyNumber,
                ParticipantSeqID = participantSeqId,
                EnrollmentDate = enrollmentDate.Truncate(TimeSpan.TicksPerDay),
                ResetInitialParticipationScoreInProcess = resetInitialScoreInProcess,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<ResetEnrollmentInitialParticipationScoreInProcessResponse> ResetEnrollmentDate20(
            string policyNumber,
            int participantSeqId,
            DateTime enrollmentDate,
            DateTime? endorsementAppliedDateTime = null,
            bool? isEndorsementDiscountZero = null,
            bool isScoreCalculated = false,
            bool isEmailSent = false,
            bool resetInitialScoreInProcess = true,
            string slot = "")
        {
            var enrollDateAdj = enrollmentDate.Truncate(TimeSpan.TicksPerDay);
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.ResetEnrollmentInitialParticipationScoreInProcessAsync(new ResetEnrollmentInitialParticipationScoreInProcessRequest
            {
                PolicyNumber = policyNumber,
                ParticipantSeqID = participantSeqId,
                IsEndorsementDiscountZero = isEndorsementDiscountZero,
                IsScoreCalculated = isScoreCalculated,
                IsEmailSent = isEmailSent,
                BeginScoreCheckDateTime = enrollDateAdj.AddDays(30),
                LastUpdateDateTime = DateTime.Now,
                CreateDate = enrollDateAdj,
                EndorsementAppliedDateTime = endorsementAppliedDateTime,
                UserName = contextAccessor.CurrentUser(),
                EnrollmentDate = enrollDateAdj,
                ResetInitialParticipationScoreInProcess = resetInitialScoreInProcess
            }), logger);
            return response;
        }

        public async Task<GetRenewalScoreHistoryResponse> GetCalculatedRenewalValues(int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetRenewalScoreHistoryAsync(new GetRenewalScoreHistoryRequest
            {
                ParticipantSeqID = participantSeqId
            }), logger);
            return response;
        }

        public async Task<SwapMobileDriversResponse> SwapDriver(string policyNumber, int srcParticipantSeqId, int destParticipantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.SwapMobileDriversAsync(new SwapMobileDriversRequest
            {
                PolicyNumber = policyNumber,
                FirstDriverParticipantSeqId = srcParticipantSeqId,
                SecondDriverParticipantSeqId = destParticipantSeqId,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<OptOutSuspensionResponse> GetOptOutSuspensions(int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetOptOutSuspensionForParticipantAsync(new GetOptOutSuspensionForParticipantRequest
            {
                ParticipantSeqID = participantSeqId
            }), logger);
            return response;
        }

        public async Task<InsertOptOutSuspensionResponse> AddOptOutSuspension(int participantSeqId, int deviceSeqId, DateTime startDate, DateTime endDate, OptOutReasonCode reason)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.InsertOptOutSuspensionAsync(new InsertOptOutSuspensionRequest
            {
                ParticipantSeqID = participantSeqId,
                DeviceSeqID = deviceSeqId,
                BeginDate = startDate.Truncate(TimeSpan.TicksPerDay),
                EndDate = endDate.Truncate(TimeSpan.TicksPerDay),
                SuspensionReasonID = (int)reason,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<UpdateOptOutSuspensionResponse> CancelOptOutSuspension(int optOutSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.UpdateOptOutSuspensionAsync(new UpdateOptOutSuspensionRequest
            {
                IsCancelled = true,
                UserName = contextAccessor.CurrentUser(),
                OptOutSuspensionSeqID = optOutSeqId
            }), logger);
            return response;
        }

        public async Task<SetMonitoringCompleteResponse> SetToMonitoringComplete(string policyNumber, int participantSeqId, int policyPeriodSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.SetMonitoringCompleteAsync(new SetMonitoringCompleteRequest
            {
                ParticipantSeqID = participantSeqId,
                PolicyNumber = policyNumber,
                PolicyPeriodSeqId = policyPeriodSeqId,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<OptOutResponse> OptOut(string policyNumber, int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.OptOutAsync(new OptOutRequest
            {
                ParticipantSeqID = participantSeqId,
                PolicyNumber = policyNumber,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<RollbackPJResponse> RollbackParticipantJunction(string policyNumber, string vin = "")
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.RollbackPJAsync(new RollbackPJRequest
            {
                PolicyNumber = policyNumber,
                VIN = vin,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<GetDeviceEventsResponse> GetConnectionTimeline(int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDeviceEventsAsync(new GetDeviceEventsRequest
            {
                ParticipantSeqID = participantSeqId
            }), logger);
            return response;
        }

        public async Task<GetDeviceRecoverySuspensionResponse> GetDeviceHistory(int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDeviceRecoverySuspensionListAsync(new GetDeviceRecoverySuspensionRequest
            {
                ParticipantSeqID = participantSeqId
            }), logger);
            return response;
        }

        public async Task<SetDeviceRecoverySuspensionResponse> UpdateSuspensionInfo(IEnumerable<int> deviceSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.SetDeviceRecoverySuspensionAsync(new SetDeviceRecoverySuspensionRequest
            {
                SuspensionSetItems = deviceSeqId.Select(x => new SuspensionSetItem { DeviceSeqID = x, UserName = contextAccessor.CurrentUser() }).ToArray()
            }), logger);
            return response;
        }

        public async Task<GetInitialParticipationInfoResponse> GetInitialParticipationInfo(int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetInitialParticipationInfoAsync(new GetInitialParticipationInfoRequest
            {
                ParticipantSeqID = participantSeqId
            }), logger);
            return response;
        }

        public async Task<InsertInitialParticipationScoreInProcessResponse> AddInitialParticipantDiscountRecord(string policyNumber, int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.InsertInitialParticipationScoreInProcessAsync(new InsertInitialParticipationScoreInProcessRequest
            {
                PolicyNumber = policyNumber,
                ParticipantSeqID = participantSeqId,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }
    }
}

