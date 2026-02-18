using AutoMapper;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.DevicePrep;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Models;
using Progressive.Telematics.Labs.Services.Models.UbiDTO;

namespace Progressive.Telematics.Labs.Business.Mappers
{
    public class SharedMappers : Profile
    {
        public SharedMappers()
        {
            CreateMap<WcfParticipantService.DeviceRecoveryItem, DeviceRecoveryItem>();

            CreateMap<WcfParticipantService.SuspensionGetItem, DeviceSuspensionItem>()
                .ForMember(dest => dest.StartDate, act => act.MapFrom(src => src.BeginDate));

            // Map WCF DeviceLot to Business Resource DeviceLot
            CreateMap<WcfDeviceLotService.DeviceLot, DeviceLot>()
                .ForMember(dest => dest.CreateDateTime, opt => opt.MapFrom(src => src.CreateDateTime))
                .ForMember(dest => dest.LotSeqID, opt => opt.MapFrom(src => src.LotSeqID))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.StatusCode, opt => opt.MapFrom(src => src.StatusCode))
                .ForMember(dest => dest.TypeCode, opt => opt.MapFrom(src => src.TypeCode))
                .ForMember(dest => dest.Messages, opt => opt.Ignore());

            // Map WCF XirgoDevice to Business Resource DeviceDetails
            CreateMap<WcfXirgoService.XirgoDevice, DeviceDetails>()
                .ForMember(dest => dest.DeviceSeqID, opt => opt.MapFrom(src => src.DeviceSeqID))
                .ForMember(dest => dest.DeviceSerialNumber, opt => opt.MapFrom(src => src.DeviceSerialNumber))
                .ForMember(dest => dest.CreateDateTime, opt => opt.MapFrom(src => src.CreateDateTime))
                .ForMember(dest => dest.SIM, opt => opt.MapFrom(src => src.SIM))
                .ForMember(dest => dest.ShipDateTime, opt => opt.MapFrom(src => src.ShipDateTime))
                .ForMember(dest => dest.FirstContactDateTime, opt => opt.MapFrom(src => src.FirstContactDateTime))
                .ForMember(dest => dest.LastContactDateTime, opt => opt.MapFrom(src => src.LastContactDateTime))
                .ForMember(dest => dest.LastUploadDateTime, opt => opt.MapFrom(src => src.LastUploadDateTime))
                .ForMember(dest => dest.VersionCode, opt => opt.MapFrom(src => src.VersionCode))
                .ForMember(dest => dest.ProgramCode, opt => opt.MapFrom(src => src.ProgramCode))
                .ForMember(dest => dest.TargetFirmwareSetCode, opt => opt.MapFrom(src => src.TargetFirmwareSetCode))
                .ForMember(dest => dest.ConfigurationFirmwareTypeVersionCode, opt => opt.MapFrom(src => src.ConfigurationFirmwareTypeVersionCode))
                .ForMember(dest => dest.OBD2FirmwareTypeVersionCode, opt => opt.MapFrom(src => src.OBD2FirmwareTypeVersionCode))
                .ForMember(dest => dest.CellFirmwareTypeVersionCode, opt => opt.MapFrom(src => src.CellFirmwareTypeVersionCode))
                .ForMember(dest => dest.GPSFirmwareTypeVersionCode, opt => opt.MapFrom(src => src.GPSFirmwareTypeVersionCode))
                .ForMember(dest => dest.MainFirmwareTypeVersionCode, opt => opt.MapFrom(src => src.MainFirmwareTypeVersionCode))
                .ForMember(dest => dest.ReportedVIN, opt => opt.MapFrom(src => src.ReportedVIN))
                .ForMember(dest => dest.WTFStateInfo, opt => opt.MapFrom(src => src.WTFStateInfo))
                .ForMember(dest => dest.ManufacturerLotSeqID, opt => opt.MapFrom(src => src.ManufacturerLotSeqID))
                .ForMember(dest => dest.ReturnLotSeqID, opt => opt.MapFrom(src => src.ReturnLotSeqID))
                .ForMember(dest => dest.IsDataCollectionAllowed, opt => opt.MapFrom(src => src.IsDataCollectionAllowed))
                .ForMember(dest => dest.IsSimActive, opt => opt.MapFrom(src => src.IsSimActive))
                .ForMember(dest => dest.IsDBImportAllowed, opt => opt.MapFrom(src => src.IsDBImportAllowed))
                .ForMember(dest => dest.IsCommunicationAllowed, opt => opt.MapFrom(src => src.IsCommunicationAllowed))
                .ForMember(dest => dest.StatusCode, opt => opt.MapFrom(src => src.StatusCode))
                .ForMember(dest => dest.BenchTestStatusCode, opt => opt.MapFrom(src => src.BenchTestStatusCode))
                .ForMember(dest => dest.BinaryTransferInfo, opt => opt.MapFrom(src => src.BinaryTransferInfo))
                .ForMember(dest => dest.CurrentAudioVolume, opt => opt.MapFrom(src => src.CurrentAudioVolume))
                .ForMember(dest => dest.TargetAudioVolume, opt => opt.MapFrom(src => src.TargetAudioVolume))
                .ForMember(dest => dest.LocationCode, opt => opt.MapFrom(src => src.LocationCode))
                .ForMember(dest => dest.ReportedProtocolCode, opt => opt.MapFrom(src => src.ReportedProtocolCode))
                .ForMember(dest => dest.LastRemoteResetDateTime, opt => opt.MapFrom(src => src.LastRemoteResetDateTime))
                .ForMember(dest => dest.IMEI, opt => opt.MapFrom(src => src.IMEI))
                .ForMember(dest => dest.RMALotSeqID, opt => opt.MapFrom(src => src.RMALotSeqID))
                .ForMember(dest => dest.InventoryLotSeqID, opt => opt.MapFrom(src => src.InventoryLotSeqID))
                .ForMember(dest => dest.IsRefurbished, opt => opt.MapFrom(src => src.IsRefurbished))
                .ForMember(dest => dest.GPSCollectionTypeCode, opt => opt.MapFrom(src => src.GPSCollectionTypeCode))
                .ForMember(dest => dest.LastChangeDateTime, opt => opt.Ignore())
                .ForMember(dest => dest.Description, opt => opt.Ignore())
                .ForMember(dest => dest.Messages, opt => opt.Ignore());
        }
    }
}

