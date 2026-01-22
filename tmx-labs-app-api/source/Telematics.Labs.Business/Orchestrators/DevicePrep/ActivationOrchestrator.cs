using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Business.Orchestrators.DevicePrep;

[SingletonService]
public interface IActivationOrchestrator
{
    Task<IEnumerable<PluginDevice>> GetDevicesInLot(string query, DeviceActivationRequestType requestAction);
}
public class ActivationOrchestrator : IActivationOrchestrator
{
    const string SIM_STATUS_EXTENDER = "SIMStatus";

    IDeviceLotService _deviceLotService;
    IXirgoDeviceService _xirgoDeviceService;
    IMapper _mapper;

    public ActivationOrchestrator(IDeviceLotService deviceLotService, IXirgoDeviceService xirgoDeviceService, IMapper mapper)
    {
        _deviceLotService = deviceLotService;
        _xirgoDeviceService = xirgoDeviceService;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PluginDevice>> GetDevicesInLot(string query, DeviceActivationRequestType requestAction)
    {
        var model = new List<PluginDevice>();

        var lotData = await _deviceLotService.GetDeviceLot(query);
        if (lotData.DeviceLot?.LotSeqID != null)
        {
            var xirgoData = await _xirgoDeviceService.GetDevicesByLot(lotData.DeviceLot.LotSeqID.Value, (DeviceLotType)lotData.DeviceLot.TypeCode);
            model = _mapper.Map<List<PluginDevice>>(xirgoData.Devices);
        }
        else
        {
            var xirgoDevice = await _xirgoDeviceService.GetDeviceBySerialNumber(query);
            var device = _mapper.Map<PluginDevice>(xirgoDevice.Device);
            if (device != null)
                model.Add(device);
        }

        if (requestAction != DeviceActivationRequestType.Status)
            model.ForEach(async x => await performActivationUpdate(x, requestAction));

        if (model.Count == 0)
            model.Add(createNotFoundModel("The lot/batch/device serial number entered could not be found.  Please retry."));

        return model;
    }

    async Task performActivationUpdate(PluginDevice device, DeviceActivationRequestType action)
    {
        if (device.Extenders["ProgramCode"] == null)
        {
            var isSIMActive = (bool)device.Extenders["IsSIMActive"];
            if (!isSIMActive && action == DeviceActivationRequestType.Activate)
            {
               // device.AddExtender(SIM_STATUS_EXTENDER, "Active");
                await _xirgoDeviceService.ActivateXirgoDevice(device.DeviceSerialNumber, device.SIM, isSIMActive);
            }

            if (isSIMActive && action == DeviceActivationRequestType.Deactivate)
            {
               // device.AddExtender(SIM_STATUS_EXTENDER, "InActive");
                await _xirgoDeviceService.ActivateXirgoDevice(device.DeviceSerialNumber, device.SIM, isSIMActive);
            }

            await _xirgoDeviceService.UpdateXirgoDevice(device.DeviceSeqId.Value, DeviceStatus.ReadyForPrep, Resources.Enums.DeviceLocation.Distributor);
        }
        //else
        //    device.AddExtender(SIM_STATUS_EXTENDER, "Device is currently assigned to a customer");

    }

    PluginDevice createNotFoundModel(string message)
    {
        var model = new PluginDevice();
       // model.AddMessage(MessageCode.Error, message);
        return model;
    }
}

