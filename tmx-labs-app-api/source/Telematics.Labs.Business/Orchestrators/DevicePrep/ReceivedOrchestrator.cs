using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Progressive.Telematics.Labs.Business.Resources.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Business.Orchestrators.DevicePrep;

[SingletonService]
public interface IReceivedOrchestrator
{
    Task<IEnumerable<DeviceLot>> GetInProcessLots();
    Task<DeviceLot> FindLot(string deviceSerialNumber);
    Task<Resource> Checkin(string query);
}
public class ReceivedOrchestrator : IReceivedOrchestrator
{
    IDeviceActivityService _deviceActivityService;
    IDeviceLotService _deviceLotService;
    IXirgoDeviceService _xirgoDeviceService;
    IMapper _mapper;

    public ReceivedOrchestrator(IDeviceActivityService deviceActivityService, IDeviceLotService deviceLotService, IXirgoDeviceService xirgoDeviceService, IMapper mapper)
    {
        _deviceActivityService = deviceActivityService;
        _deviceLotService = deviceLotService;
        _xirgoDeviceService = xirgoDeviceService;
        _mapper = mapper;
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
                var returnLot = _deviceLotService.GetDeviceLot(xirgoDevice.Device.ReturnLotSeqID.Value).Result.DeviceLot;
                if (returnLot.Name.Length > 0 && returnLot.CreateDateTime >= lot.CreateDate)
                {
                    lot.Type = DeviceLotType.Returned;
                    lot.Name = returnLot.Name;
                }
            }
        }
        else
        {
          //  lot.AddMessage(MessageCode.Error, $"Unable to find batch or lot for device {deviceSerialNumber}");
        }

        return lot;
    }

    public async Task<Resource> Checkin(string query)
    {
        var resource = new Resource();
        var lot = await _deviceLotService.GetDeviceLot(query);
        if (lot.DeviceLot != null)
        {
            if (lot.DeviceLot.StatusCode == (int)DeviceLotStatus.ShippedToDistributor)
            {
                var devicesUpdated = await _deviceLotService.ReceiveLot(lot.DeviceLot.Name);
              //  resource.AddExtender("DevicesUpdated", devicesUpdated.TotalDevicesUpdated);
              //  resource.AddExtender("LotName", query);
                //"{0} Device(s) have been received for Lot {1}.", response.TotalDevicesUpdated, receiveDevicesViewModel.LotName
            }
            //else
               // resource.AddMessage(MessageCode.Error, "The lot is not in a status that allows it to be processed.");
        }
        else
        {
            var response = await _xirgoDeviceService.GetDeviceBySerialNumber(query);
            var device = response.Device;
            if (device != null)
            {
                //if (device.ProgramCode != null)
                //   // resource.AddMessage(MessageCode.Error, $"Device {device.DeviceSerialNumber} is already assigned to a customer.");
                //else
                //{
                //    if (device.StatusCode != (int)DeviceStatus.Unavailable &&
                //        (device.LocationCode == (int)Resources.Enums.DeviceLocation.ShippedFromMfgtoDist ||
                //        device.LocationCode == (int)Resources.Enums.DeviceLocation.ShippedFromPrgtoDist))
                //    {
                //        await _xirgoDeviceService.UpdateXirgoDevice(device.DeviceSeqID.Value, (DeviceStatus)device.StatusCode, (Resources.Enums.DeviceLocation)device.LocationCode);
                //        await _deviceActivityService.AddDeviceActivity(device.DeviceSeqID.Value, "Device status changed to 9 and Location changed to 2");
                //        //receiveDevicesViewModel.DisplaySuccessMessage = string.Format("Device {0} has been received.", receiveDevicesViewModel.LotName);
                //    }
                //    //else
                //      //  resource.AddMessage(MessageCode.Error, $"The device serial number {device.DeviceSerialNumber}, is not in a status to be able to receive.");
                //}
            }
            //else
               // resource.AddMessage(MessageCode.Error, $"{query} isn't a lot, batch or device serial number.  Please verify your entry.");
        }

        return resource;
    }
}

