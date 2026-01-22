using AutoMapper;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources;
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
        }
    }
}

