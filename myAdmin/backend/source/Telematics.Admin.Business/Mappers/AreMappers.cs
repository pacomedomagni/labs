using AutoMapper;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Models;

namespace Progressive.Telematics.Admin.Business.Mappers
{
    public class AreMappers : Profile
    {
        public AreMappers()
        {
            CreateMap<ClaimsParticipantSummaryResponse, AreParticipantDetails>()
                .ForMember(dest => dest.ADEnrolled, x => x.MapFrom(src => src.IsAccidentResponseEnrolled))
                .ForMember(dest => dest.ADActivated, x => x.MapFrom(src => src.IsAccidentResponseActivated));

            CreateMap<HomebaseParticipantSummaryResponse, AreParticipantDetails>();

            CreateMap<PolicyServicingDriver, AreParticipantDetails>()
                .ForMember(dest => dest.DriverFirstName, x=> x.MapFrom(src => src.FirstName));
        }
    }
}
