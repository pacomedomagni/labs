using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService
{
    [SingletonService]
    public interface IMobileActionsOrchestrator
    {
        Task<WcfParticipantService.SwitchMobileToOBDResponse> SwitchToOBD(string policyNumber, int participantSeqId);
        Task SwapDriver(string policyNumber, int srcParticipantSeqId, int destParticipantSeqId);
        Task<List<Registration>> GetMobileRegistrationData(string groupExternalId);
        Task<MobileContext[]> ReturnMobileContexts(int participantSeqId);
    }

    public class MobileActionsOrchestrator : IMobileActionsOrchestrator
    {
        private readonly IDeviceApi deviceApi;
        private readonly IPolicyApi policyApi;
        private readonly IParticipantService participantService;
        private readonly IPolicyDAL policyDAL;

        public MobileActionsOrchestrator(
            IDeviceApi deviceApi,
            IPolicyApi policyApi,
            IParticipantService participantService,
            IPolicyDAL policyDAL)
        {
            this.deviceApi = deviceApi;
            this.policyApi = policyApi;
            this.participantService = participantService;
            this.policyDAL = policyDAL;
        }

        public async Task<Registration[]> ReturnConflictMobileDeviceRegistrations(string mobileId)
        {
            var registrations = await deviceApi.GetUnfilteredRegistrations(mobileId);
            var conflicts = registrations.Where(x =>
                x.ProgramCode != ProgramCode.Snapshot && x.MobileRegistrationStatusCode != MobileRegistrationStatus.Inactive &&
                x.MobileRegistrationStatusCode != MobileRegistrationStatus.PendingResolution);
            return conflicts.ToArray();
        }

        public async Task<WcfParticipantService.SwitchMobileToOBDResponse> SwitchToOBD(string policyNumber, int participantSeqId)
        {
            return await participantService.SwitchToOBD(policyNumber, participantSeqId);
        }

        public async Task SwapDriver(string policyNumber, int srcParticipantSeqId, int destParticipantSeqId)
        {
            await participantService.SwapDriver(policyNumber, srcParticipantSeqId, destParticipantSeqId);
        }

        public async Task<List<Registration>> GetMobileRegistrationData(string groupExternalId)
        {
            var data = await deviceApi.GetRegistrationsByGroupExternalId(groupExternalId);
            data?.ForEach(x => x.AddExtender("ChallengeExpired", x.ChallengeExpirationDateTime <= DateTime.Now));
            return data;
        }

        public async Task<MobileContext[]> ReturnMobileContexts(int participantSeqId)
        {
            var model = await policyDAL.GetMobileContexts(participantSeqId);
            return model.ToArray();
        }
    }
}
