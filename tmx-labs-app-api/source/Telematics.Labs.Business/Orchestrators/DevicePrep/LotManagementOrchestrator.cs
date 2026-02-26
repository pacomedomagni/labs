using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfXirgoService;

namespace Progressive.Telematics.Labs.Business.Orchestrators.DevicePrep
{
    [SingletonService]
    public interface ILotManagementOrchestrator
    {
        Task<IEnumerable<DeviceLot>> GetLotsForMarkBenchTestComplete();
        Task<IEnumerable<DeviceLot>> GetInProcessLots();
        Task<DeviceLot> FindLot(string deviceSerialNumber);
        Task<Resource> Checkin(string query);
        Task<DeviceLot> GetDeviceLot(string lotName);
        Task<Progressive.Telematics.Labs.Business.Resources.DevicePrep.GetDevicesByLotResponse> GetDevicesByLot(int lotSeqId, DeviceLotType lotType);
        Task<Resource> UpdateLotActivationStatus(int lotSeqId, ActivationAction action);
        Task<Resource> UpdateLotStatus(int lotSeqId, DeviceLotType typeCode, LotStatus? statusCode, string name);
        Task<int> GetBenchtestQuotaPercentage();
    }

    public class LotManagementOrchestrator : ILotManagementOrchestrator
    {
        private const int DEFAULT_BENCHTEST_QUOTA = 2;

        private readonly ILogger<LotManagementOrchestrator> _logger;
        private readonly ILotManagementDAL _lotManagementDAL;
        private readonly IDeviceLotService _deviceLotService;
        private readonly IXirgoDeviceService _xirgoDeviceService;
        private readonly IConfigValuesDAL _configValuesDAL;
        private readonly IMapper _mapper;

        public LotManagementOrchestrator(
            ILogger<LotManagementOrchestrator> logger,
            ILotManagementDAL lotManagementDAL,
            IDeviceLotService deviceLotService,
            IXirgoDeviceService xirgoDeviceService,
            IConfigValuesDAL configValuesDAL,
            IMapper mapper)
        {
            _logger = logger;
            _lotManagementDAL = lotManagementDAL;
            _deviceLotService = deviceLotService;
            _xirgoDeviceService = xirgoDeviceService;
            _configValuesDAL = configValuesDAL;
            _mapper = mapper;
        }

        public async Task<int> GetBenchtestQuotaPercentage()
        {
            try {
                var configValue = await _configValuesDAL.GetConfigValueByKey("BenchtestQuotaPercentage");

                if (configValue != null && int.TryParse(configValue.ConfigValue, out var percentage))
                {
                    return percentage;
                }

                return DEFAULT_BENCHTEST_QUOTA;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving bench test quota percentage from config values. Returning default value of {DefaultValue}%.", DEFAULT_BENCHTEST_QUOTA);
                return DEFAULT_BENCHTEST_QUOTA;
            }

        }

        public async Task<IEnumerable<DeviceLot>> GetLotsForMarkBenchTestComplete()
        {
            var lotData = await _lotManagementDAL.GetLotsForMarkBenchTestComplete();

            if (lotData == null)
            {
                return Enumerable.Empty<DeviceLot>();
            }

            var lots = lotData.Select(lot => new DeviceLot
            {
                Name = lot.Name,
                LotSeqID = lot.LotSeqID,
                CreateDateTime = lot.CreateDateTime,
                StatusCode = lot.StatusCode,
                TypeCode = lot.TypeCode
            });

            return lots;
        }

        public async Task<IEnumerable<DeviceLot>> GetInProcessLots()
        {
            var data = await _deviceLotService.GetDeviceLotsInProcess();
            var model = _mapper.Map<IEnumerable<DeviceLot>>(data.DeviceLots);
            return model;
        }

        public async Task<DeviceLot> FindLot(string deviceSerialNumber)
        {
            var lot = new DeviceLot();
            var xirgoDevice = await _xirgoDeviceService.GetDeviceBySerialNumber(deviceSerialNumber);

            if (xirgoDevice.Device?.DeviceSeqID != null)
            {
                var response = await _deviceLotService.GetDeviceLot(xirgoDevice.Device.ManufacturerLotSeqID.Value);
                lot = _mapper.Map<DeviceLot>(response.DeviceLot);

                if (lot.Name.Length > 0)
                    lot.Type = DeviceLotType.Manufacturer;

                if (xirgoDevice.Device?.ReturnLotSeqID != null)
                {
                    var returnLotResponse = await _deviceLotService.GetDeviceLot(xirgoDevice.Device.ReturnLotSeqID.Value);
                    var returnLot = returnLotResponse.DeviceLot;

                    if (returnLot.Name.Length > 0 && returnLot.CreateDateTime >= lot.CreateDate)
                    {
                        lot.Type = DeviceLotType.Returned;
                        lot.Name = returnLot.Name;
                    }
                }
            }

            return lot;
        }

        public async Task<Resource> Checkin(string query)
        {
            var resource = new Resource();
            var lot = await _deviceLotService.GetDeviceLot(query);

            if (lot?.DeviceLot != null)
            {
                if (lot.DeviceLot.StatusCode == (int)DeviceLotStatus.ShippedToDistributor)
                {
                    var devicesUpdated = await _deviceLotService.ReceiveLot(lot.DeviceLot.Name);
                }
            }
            else
            {
                var response = await _xirgoDeviceService.GetDeviceBySerialNumber(query);
                if (response?.Device != null)
                {
                    var device = response.Device;
                }
            }

            return resource;
        }

        public async Task<DeviceLot> GetDeviceLot(string lotName)
        {
            var response = await _deviceLotService.GetDeviceLot(lotName);

            if (response.DeviceLot == null)
            {
                return null;
            }

            var lot = _mapper.Map<DeviceLot>(response.DeviceLot);
            return lot;
        }

        public async Task<Progressive.Telematics.Labs.Business.Resources.DevicePrep.GetDevicesByLotResponse> GetDevicesByLot(int lotSeqId, DeviceLotType lotType)
        {
            var wcfResponse = await _xirgoDeviceService.GetDevicesByLot(lotSeqId, lotType);

            var response = new Progressive.Telematics.Labs.Business.Resources.DevicePrep.GetDevicesByLotResponse();

            if (wcfResponse.Devices != null && wcfResponse.Devices.Length > 0)
            {
                response.Devices = _mapper.Map<DeviceDetails[]>(wcfResponse.Devices);
                response.DeviceCount = response.Devices.Length;
            }
            else
            {
                response.Devices = System.Array.Empty<DeviceDetails>();
                response.DeviceCount = 0;
            }

            return response;
        }

        public async Task<Resource> UpdateLotActivationStatus(int lotSeqId, ActivationAction action)
        {
            var resource = new Resource();
            var isSIMActive = action == ActivationAction.Activate;

            var devicesResponse = await _xirgoDeviceService.GetDevicesByLot(lotSeqId, DeviceLotType.Manufacturer);

            if (devicesResponse.Devices == null || devicesResponse.Devices.Length == 0)
            {
                resource.AddMessage(MessageCode.ErrorCode, "NotFound");
                resource.AddMessage(MessageCode.ErrorDetails, $"No devices found for lot {lotSeqId}");
                return resource;
            }

            foreach (var device in devicesResponse.Devices)
            {
                await _xirgoDeviceService.ActivateXirgoDevice(device.DeviceSerialNumber, device.SIM, isSIMActive);
            }

            resource.AddMessage(MessageCode.StatusDescription,
                $"{(isSIMActive ? "Activated" : "Deactivated")} {devicesResponse.Devices.Length} device(s) in lot {lotSeqId}");

            return resource;
        }

        /// <summary>
        /// Update lot status code/name for the given lotSeqId and type
        /// </summary>
        /// <param name="lotSeqId"></param>
        /// <param name="typeCode">Type of lot we are updating (for lookup - will not be updated)</param>
        /// <param name="statusCode">Status code to update the lot with</param>
        /// <returns>Resource with relevant statuses</returns>
        public async Task<Resource> UpdateLotStatus(int lotSeqId, DeviceLotType typeCode, LotStatus? statusCode, string name)
        {
            var resource = new Resource();
            await _lotManagementDAL.UpdateLot(lotSeqId, name, (int?)statusCode, null);

            // If we are updating lot status to ShipmentReceivedByDistributor, update the device locations
            if (statusCode == LotStatus.ShipmentReceivedByDistributor)
            {
                var deviceResponse = await _xirgoDeviceService.GetDevicesByLot(lotSeqId, typeCode);
                if (deviceResponse.ResponseStatus == WcfXirgoService.ResponseStatus.Success && deviceResponse.resultCount > 0)
                {
                    foreach (var device in deviceResponse.Devices)
                    {
                        var updateRequest = new UpdateDeviceRequest();
                        updateRequest.Device = new XirgoDevice
                        {
                            DeviceSeqID = device.DeviceSeqID,
                            LocationCode = (int)DeviceLocation.Distributor
                        };

                        await _xirgoDeviceService.UpdateAsync(updateRequest);
                    }
                }
            }

            resource.AddMessage(MessageCode.StatusDescription, $"Successfully updated lot {lotSeqId}");
            return resource;
        }
    }
}
