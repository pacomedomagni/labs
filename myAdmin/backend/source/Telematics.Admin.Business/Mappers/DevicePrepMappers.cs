using System;
using AutoMapper;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Business.Mappers
{
    public class DevicePrepMappers : Profile
    {
        public DevicePrepMappers()
        {
            CreateMap<WcfXirgoSessionService.XirgoSession, DeviceLocationInfo>()
                .ForMember(dest => dest.LocationDate, x => x.MapFrom(src => src.GPSDateTime));

            CreateMap<WcfDeviceLotService.DeviceLot, DeviceLot>()
                .ForMember(dest => dest.CreateDate, x => x.MapFrom(src => Convert.ToDateTime(src.CreateDateTime)))
                .ForMember(dest => dest.SeqId, x => x.MapFrom(src => src.LotSeqID))
                .ForMember(dest => dest.Status, x => x.MapFrom(src => src.StatusCode))
                .ForMember(dest => dest.Type, x => x.MapFrom(src => src.TypeCode));
        }
    }
}
