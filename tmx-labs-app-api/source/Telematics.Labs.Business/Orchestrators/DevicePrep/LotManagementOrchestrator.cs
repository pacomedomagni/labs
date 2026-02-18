using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared.Attributes;

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
    }

    public class LotManagementOrchestrator : ILotManagementOrchestrator
    {
        private readonly ILotManagementDAL _lotManagementDAL;
        private readonly IDeviceLotService _deviceLotService;
        private readonly IXirgoDeviceService _xirgoDeviceService;
        private readonly IMapper _mapper;

        public LotManagementOrchestrator(
            ILotManagementDAL lotManagementDAL,
            IDeviceLotService deviceLotService,
            IXirgoDeviceService xirgoDeviceService,
            IMapper mapper)
        {
            _lotManagementDAL = lotManagementDAL;
            _deviceLotService = deviceLotService;
            _xirgoDeviceService = xirgoDeviceService;
            _mapper = mapper;
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
    }
}
