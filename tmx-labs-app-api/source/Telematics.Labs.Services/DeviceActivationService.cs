using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfXirgoService;

namespace Progressive.Telematics.Labs.Services
{
    [SingletonService]
    public interface IDeviceActivationService
    {
        Task<DeviceActivationResult> ActivateOrDeactivateLotDevices(
            int lotSeqId,
            XirgoDevice[] devices,
            ActivationAction action);
    }

    public class DeviceActivationService : IDeviceActivationService
    {
        private readonly ILogger<DeviceActivationService> _logger;
        private readonly ISimManagementDAL _simManagementDAL;
        private readonly IXirgoDeviceDAL _xirgoDeviceDAL;
        private readonly IDeviceLotService _deviceLotService;
        private readonly ILotManagementDAL _lotManagementDAL;

        public DeviceActivationService(
            ILogger<DeviceActivationService> logger,
            ISimManagementDAL simManagementDAL,
            IXirgoDeviceDAL xirgoDeviceDAL,
            IDeviceLotService deviceLotService,
            ILotManagementDAL lotManagementDAL)
        {
            _logger = logger;
            _simManagementDAL = simManagementDAL;
            _xirgoDeviceDAL = xirgoDeviceDAL;
            _deviceLotService = deviceLotService;
            _lotManagementDAL = lotManagementDAL;
        }

        public async Task<DeviceActivationResult> ActivateOrDeactivateLotDevices(
            int lotSeqId,
            XirgoDevice[] devices,
            ActivationAction action)
        {
            var result = new DeviceActivationResult();
            var (eligibleDevices, assignedDevices) = SeparateDevicesByEligibility(devices);

            result.AssignedDevices = assignedDevices;
            result.EligibleDevices = eligibleDevices;

            if (eligibleDevices.Count == 0)
            {
                return result;
            }

            var actionCode = action == ActivationAction.Activate ? 1 : 0;
            var effectiveDate = DateTime.UtcNow;

            var simRecords = BuildSimManagementRecords(eligibleDevices, effectiveDate, actionCode);
            var deviceUpdates = BuildDeviceUpdateRecords(eligibleDevices, action);

            await _simManagementDAL.ActivateOrDeactivateLot(simRecords);
            await _xirgoDeviceDAL.BulkUpdateXirgoDevices(deviceUpdates);
            await UpdateLotStatusIfNeeded(lotSeqId, action);

            _logger.LogInformation(
                "Updated SIM management records and device status for lot {LotSeqId} with action {Action}",
                lotSeqId,
                action);

            result.Success = true;
            return result;
        }

        private (List<XirgoDevice> eligible, List<XirgoDevice> assigned) SeparateDevicesByEligibility(
            XirgoDevice[] devices)
        {
            var assignedDevices = devices.Where(d => d.ProgramCode.HasValue).ToList();
            var eligibleDevices = devices.Where(d => !d.ProgramCode.HasValue).ToList();

            return (eligibleDevices, assignedDevices);
        }

        private IEnumerable<SimManagementRecord> BuildSimManagementRecords(
            List<XirgoDevice> eligibleDevices,
            DateTime effectiveDate,
            int actionCode)
        {
            return eligibleDevices
                .Where(d => !string.IsNullOrEmpty(d.SIM))
                .Select(d => new SimManagementRecord
                {
                    SIM = d.SIM,
                    EffectiveDate = effectiveDate,
                    Action = actionCode,
                    NewRecordStatus = "New"
                });
        }

        private IEnumerable<XirgoDeviceBulkUpdateModel> BuildDeviceUpdateRecords(
            List<XirgoDevice> eligibleDevices,
            ActivationAction action)
        {
            return eligibleDevices.Select(d => new XirgoDeviceBulkUpdateModel
            {
                DeviceSeqID = d.DeviceSeqID.Value,
                StatusCode = (int)DeviceStatus.ReadyForPrep,
                LocationCode = action == ActivationAction.Activate ? (int)DeviceLocation.Distributor : null
            });
        }

        private async Task UpdateLotStatusIfNeeded(int lotSeqId, ActivationAction action)
        {
            var lotResponse = await _deviceLotService.GetDeviceLot(lotSeqId);

            if (action == ActivationAction.Activate && lotResponse?.DeviceLot != null && lotResponse.DeviceLot.StatusCode == 1)
            {
                await _lotManagementDAL.UpdateLot(lotSeqId, null, 2, null);
                _logger.LogInformation("Updated lot {LotSeqId} status code from 1 to 2", lotSeqId);
            }
        }
    }

    public class DeviceActivationResult
    {
        public bool Success { get; set; }
        public List<XirgoDevice> EligibleDevices { get; set; } = new();
        public List<XirgoDevice> AssignedDevices { get; set; } = new();
    }
}
