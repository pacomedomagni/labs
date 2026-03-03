using AutoMapper;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService
{
    [SingletonService]
    public interface IPluginActionsOrchestrator
    {
        Task ActivateDevice(string policyNumber, string serialNumber);
        Task UpdateDeviceAudio(string serialNumber, bool isAudioEnabled);
        Task<ConnectionTimeline> GetConnectionTimeline(string policyNumber, int participantSeqId, string vin, ProgramType programType);
        Task PingDevice(string serialNumber);
        Task ResetDevice(string serialNumber);
        Task ReplaceDevice(string policyNumber, int participantSeqId);
        Task SwapDevice(string policyNumber, int srcParticipantSeqId, int destParticipantSeqId);
        Task MarkDeviceDefective(string policyNumber, string serialNumber);
        Task<PluginDevice> DeviceInformation(string serialNumber, bool includeDetailedInfo = false, int? participantSeqId = null);
        Task CancelDeviceReplacement(string policyNumber, int participantSeqId);
        Task StopDeviceShipment(string policyNumber, int participantSeqId, int policyPeriodSeqId, StopShipmentMethod stopMethod);
        Task MarkDeviceAbandoned(string policyNumber, int participantSeqId, string serialNumber, short? policySuffix, short? expirationYear);
        Task<List<DeviceLocationInfo>> DeviceLocation(string serialNumber, DateTime lastContactDate);
        Task<DeviceHistory> GetDeviceHistory(int? participantSeqId = null, string serialNumber = "");
        Task UpdateSuspensionInfo(List<int> deviceSeqIds);
        Task<ParticipantCalculatedInitialValues> GetInitialParticipationInfo(int participantSeqId);
        Task AddInitialParticipantDiscountRecord(string policyNumber, int participantSeqId);
        Task<string> GetAudioStatus(string deviceSerialNumber);
        Task SetAudioStatus(bool isAudioOn, string deviceSerialNumber);
        Task<WcfDevice.FeeReversalResponse> FeeReversal(string deviceSerialNumber, short? expirationYear, int participantSeqID, string policyNumber, short? policySuffix);
        Task MobileReEnroll(string policyNumber, string participantId, string mobileNumber);
        Task UpdateAdminStatusToActive(string policyNumber, string participantID, string deviceSerialNumber, string name);
        Task UpdateAdminStatusForOptOut(string policyNumber, string participantID, string name);
        Task<string> GetUspsShipTrackingNumber(string deviceSerialNumber);
    }

    public class PluginActionsOrchestrator : IPluginActionsOrchestrator
    {
        private readonly IPolicyDAL policyDB;
        private readonly IDeviceApi deviceApi;
        private readonly IDeviceService deviceService;
        private readonly IParticipantService participantService;
        private readonly IXirgoDeviceService xirgoDeviceService;
        private readonly IXirgoSessionService xirgoSessionService;
        private readonly IParticipantActionsOrchestrator participantOrchestrator;
        private readonly IValueCalculatorService valueCalculatorService;
        private readonly IHomebaseDAL homebaseDB;
        private readonly IMapper mapper;

        public PluginActionsOrchestrator(IPolicyDAL policyDB, IDeviceService deviceService, IParticipantService participantService, IXirgoDeviceService xirgoDeviceService, IXirgoSessionService xirgoSessionService, IParticipantActionsOrchestrator participantOrchestrator, IValueCalculatorService valueCalculatorService, IDeviceApi deviceApi, IHomebaseDAL homebaseDB, IMapper mapper)
        {
            this.policyDB = policyDB;
            this.deviceService = deviceService;
            this.participantService = participantService;
            this.valueCalculatorService = valueCalculatorService;
            this.xirgoDeviceService = xirgoDeviceService;
            this.xirgoSessionService = xirgoSessionService;
            this.participantOrchestrator = participantOrchestrator;
            this.deviceApi = deviceApi;
            this.homebaseDB = homebaseDB;
            this.mapper = mapper;
        }

        public async Task ActivateDevice(string policyNumber, string serialNumber)
        {
            await deviceService.ActivateDevice(policyNumber, serialNumber);
        }

        public async Task UpdateDeviceAudio(string serialNumber, bool isAudioEnabled)
        {
            await xirgoDeviceService.UpdateDeviceAudio(serialNumber, isAudioEnabled);
        }

        public async Task<ConnectionTimeline> GetConnectionTimeline(string policyNumber, int participantSeqId, string vin, ProgramType programType)
        {
            var calcData = await valueCalculatorService.GetCalculatedValues(participantSeqId);
            var data = await participantService.GetConnectionTimeline(participantSeqId);
            var model = new ConnectionTimeline { TotalMonitoringDuration = new TimeSpan(0, 0, calcData.Connectivity.ConnectedSeconds) };
            var pairs = new List<DisconnectionInterval>();
            var events = from e in data.DeviceEvents
                         where (e.EventCode == 0 || e.EventCode == 1) && e.EventTime > DateTime.Now.AddYears(-1)
                         select e;

            var eventsList = events.ToList();

            // Remove duplicate events (same EventCode and EventTime)
            eventsList = eventsList
                .GroupBy(e => new { e.EventCode, e.EventTime })
                .Select(g => g.First())
                .OrderBy(e => e.EventTime)
                .ToList();

            DisconnectionInterval store = null;
            eventsList.ForEach(e =>
            {
                if (store == null)
                {
                    if (e.EventCode == 0)
                        store = new DisconnectionInterval { Connection = e.EventTime };
                    else
                        store = new DisconnectionInterval { Disconnection = e.EventTime };
                }
                else
                {
                    if (e.EventCode == 0)
                    {
                        store.Connection = e.EventTime;
                        if (store.Connection != null && store.Disconnection != null)
                        {
                            pairs.Add(store);
                        }
                        store = null;
                    }
                    else
                    {
                        if (store.Connection != null && store.Disconnection != null)
                        {
                            pairs.Add(store);
                        }
                        store = new DisconnectionInterval { Disconnection = e.EventTime };
                    }
                }
            });

            if (store != null && store.Connection != null && store.Disconnection != null)
            {
                pairs.Add(store);
            }

            model.EventPairs = pairs;
            return model;
        }

        public async Task PingDevice(string serialNumber)
        {
            await xirgoDeviceService.PingDevice(serialNumber);
        }

        public async Task ResetDevice(string serialNumber)
        {
            await xirgoDeviceService.ResetDevice(serialNumber);
        }

        public async Task ReplaceDevice(string policyNumber, int participantSeqId)
        {
            await deviceService.ReplaceDevice(policyNumber, participantSeqId);
        }

        public async Task CancelDeviceReplacement(string policyNumber, int participantSeqId)
        {
            await deviceService.CancelDeviceReplacement(policyNumber, participantSeqId);
        }

        public async Task SwapDevice(string policyNumber, int srcParticipantSeqId, int destParticipantSeqId)
        {
            await deviceService.SwapDevice(policyNumber, srcParticipantSeqId, destParticipantSeqId);
        }

        public async Task MarkDeviceDefective(string policyNumber, string serialNumber)
        {
            await deviceService.MarkDeviceDefective(policyNumber, serialNumber);
        }

        public async Task<PluginDevice> DeviceInformation(string serialNumber, bool includeDetailedInfo = false, int? participantSeqId = null)
        {
            var (xirgoDeviceInfoResp, xirgoDeviceDetailsRespo, xirgoDeviceFeaturesResp, deviceInfoResp) = await (
                xirgoDeviceService.XirgoDeviceInformation(serialNumber),
                xirgoDeviceService.GetDeviceBySerialNumber(serialNumber),
                xirgoDeviceService.DeviceFeatures(serialNumber),
                deviceService.DeviceInformation(serialNumber));

            var model = mapper.Map<PluginDevice>(xirgoDeviceInfoResp);
            mapper.Map(deviceInfoResp.Device, model);
            mapper.Map(xirgoDeviceDetailsRespo.Device, model);

            model.Features = xirgoDeviceFeaturesResp.Features.Select(x => (DeviceFeature)x.Code).ToList();

            if (includeDetailedInfo)
            {
                model.FirmwareDetails = mapper.Map<DeviceFirmwareDetails>(xirgoDeviceInfoResp);
                model.History = await GetDeviceHistory(participantSeqId, serialNumber);

                model.AddExtender("FirstContactDate", xirgoDeviceDetailsRespo.Device.FirstContactDateTime);
                model.AddExtender("LastContactDate", xirgoDeviceDetailsRespo.Device.LastContactDateTime);
                model.AddExtender("LastUploadDate", xirgoDeviceDetailsRespo.Device.LastUploadDateTime);
                model.AddExtender("IsDBImportAllowed", xirgoDeviceDetailsRespo.Device.IsDBImportAllowed);
                model.AddExtender("IsCommunicationAllowed", xirgoDeviceDetailsRespo.Device.IsCommunicationAllowed);
                model.AddExtender("IsDataCollectionAllowed", xirgoDeviceDetailsRespo.Device.IsDataCollectionAllowed);
            }

            return model;
        }

        public async Task MarkDeviceAbandoned(string policyNumber, int participantSeqId, string serialNumber, short? policySuffix = null, short? expirationYear = null)
        {
            await deviceService.MarkDeviceAbandoned(policyNumber, participantSeqId, serialNumber, policySuffix, expirationYear);
        }

        public async Task StopDeviceShipment(string policyNumber, int participantSeqId, int policyPeriodSeqId, StopShipmentMethod stopMethod)
        {
            switch (stopMethod)
            {
                case StopShipmentMethod.SetMonitoringComplete:
                    await participantOrchestrator.SetToMonitoringComplete(policyNumber, participantSeqId, policyPeriodSeqId);
                    break;
                case StopShipmentMethod.OptOut:
                    await participantOrchestrator.OptOut(policyNumber, participantSeqId);
                    break;
            }
        }

        public async Task<List<DeviceLocationInfo>> DeviceLocation(string serialNumber, DateTime lastContactDate)
        {
            var data = await xirgoSessionService.GetDeviceLocation(serialNumber, lastContactDate);
            var filteredData = data.XirgoSessionList.Where(x => x.GPSDateTime != null).OrderByDescending(x => x.GPSDateTime).Take(10);
            var model = mapper.Map<List<DeviceLocationInfo>>(filteredData);
            return model;
        }

        public async Task<DeviceHistory> GetDeviceHistory(int? participantSeqId = null, string serialNumber = "")
        {
            var model = new DeviceHistory();

            if (participantSeqId.HasValue)
            {
                var participantResponse = await participantService.GetDeviceHistory(participantSeqId.Value);
                model.RecoveryInfo = mapper.Map<List<DeviceRecoveryItem>>(participantResponse.DeviceRecovery);
                model.SuspensionInfo = mapper.Map<List<DeviceSuspensionItem>>(participantResponse.SuspensionHistory);
            }

            if (!string.IsNullOrWhiteSpace(serialNumber))
            {
                var deviceResponse = await deviceService.GetDeviceHistory(serialNumber);
                model.ShippingInfo = mapper.Map<List<DeviceShippingInformation>>(deviceResponse.DeviceHistory);
            }

            return model;
        }

        public async Task UpdateSuspensionInfo(List<int> deviceSeqIds)
        {
            await participantService.UpdateSuspensionInfo(deviceSeqIds);
        }

        public async Task<ParticipantCalculatedInitialValues> GetInitialParticipationInfo(int participantSeqId)
        {
            var data = await participantService.GetInitialParticipationInfo(participantSeqId);


            var model = mapper.Map<ParticipantCalculatedInitialValues>(data.InitialParticipationInProcess);
            if (model != null)
            {
                model.ScoreInfo = mapper.Map<ParticipantCalculatedRenewalValues>(data.InitialParticipationScore);
            }

            return model;
        }

        public async Task AddInitialParticipantDiscountRecord(string policyNumber, int participantSeqId)
        {
            await participantService.AddInitialParticipantDiscountRecord(policyNumber, participantSeqId);
        }

        public async Task<string> GetAudioStatus(string deviceSerialNumber)
        {
            return await deviceApi.GetAudioStatus(deviceSerialNumber);
        }


        public async Task SetAudioStatus(bool isAudioOn, string deviceSerialNumber)
        {
            await deviceApi.SetAudioStatus(deviceSerialNumber, isAudioOn);
        }

        public async Task<WcfDevice.FeeReversalResponse> FeeReversal(string deviceSerialNumber, short? expirationYear, int participantSeqID, string policyNumber, short? policySuffix)
        {
            return await deviceService.FeeReversal(deviceSerialNumber, expirationYear, participantSeqID, policyNumber, policySuffix);
        }

        public async Task MobileReEnroll(string policyNumber, string participantId, string mobileNumber)
        {
            await policyDB.ReEnrollInMobile(policyNumber, participantId, mobileNumber);
        }

        public async Task UpdateAdminStatusToActive(string policyNumber, string participantID, string deviceSerialNumber, string name)
        {
            await policyDB.UpdateAdminStatusToActive(policyNumber, participantID, deviceSerialNumber, name);
        }

        public async Task UpdateAdminStatusForOptOut(string policyNumber, string participantID, string name)
        {
            await policyDB.UpdateAdminStatusForOptOut(policyNumber, participantID, name);
        }

        public async Task<string> GetUspsShipTrackingNumber(string deviceSerialNumber)
        {
            // 1. Get most recent OrderSeqId using the device serial number
            int? orderSeqId = await policyDB.GetMostRecentOrderSeqIdByDeviceSerialNumber(deviceSerialNumber);
            if (orderSeqId == null)
                return null;

            // 2. Get tracking number from UBIHomeBase
            string trackingNumber = await homebaseDB.GetUspsShipTrackingNumberByOrderSeqId(orderSeqId.Value);
            return trackingNumber;
        }
    }
}
