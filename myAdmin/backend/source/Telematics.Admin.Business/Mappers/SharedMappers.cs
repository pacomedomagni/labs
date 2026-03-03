using AutoMapper;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Services.Models.UbiDTO;

namespace Progressive.Telematics.Admin.Business.Mappers
{
    public class SharedMappers : Profile
    {
        public SharedMappers()
        {
            CreateMap<WcfPolicyService.Policy, Address>()
                .ForMember(dest => dest.ContactName, x => x.MapFrom(src => src.Name))
                .ForMember(dest => dest.State, x => x.MapFrom(src => src.MailingState))
                .ForMember(dest => dest.ZipCode, x => x.MapFrom(src => src.Zip));

            CreateMap<WcfPolicyService.Policy, AppInfo>();

            CreateMap<WcfPolicyService.Participant, MobileDevice>()
                .ForMember(dest => dest.DeviceSeqId, src => src.MapFrom(x => x.DeviceSeqID));

            CreateMap<WcfPolicyService.Participant, Participant>()
                .ForMember(
                    dest => dest.TelematicsId,
                    x => x.MapFrom(src => src.ParticipantExternalID)
                )
                .ForMember(dest => dest.SnapshotDetails, x => x.MapFrom(src => src))
                .ForMember(
                    dest => dest.MobileDeviceDetails,
                    opt =>
                    {
                        opt.PreCondition(
                            src =>
                                (
                                    (DeviceExperience)src.DeviceExperienceTypeCode
                                    == DeviceExperience.Mobile
                                )
                        );
                        opt.MapFrom(src => src);
                    }
                )
                .ForMember(
                    dest => dest.PluginDeviceDetails,
                    opt =>
                    {
                        opt.PreCondition(
                            src =>
                                (
                                    (DeviceExperience)src.DeviceExperienceTypeCode
                                    != DeviceExperience.Mobile
                                )
                                && src.DeviceSeqID != null
                        );
                        opt.MapFrom(src => src);
                    }
                );

            CreateMap<ClaimsParticipantSummaryResponse, Participant>()
                .ForMember(dest => dest.AreDetails, x => x.MapFrom(src => src));

            CreateMap<HomebaseParticipantSummaryResponse, Participant>()
                .ForMember(dest => dest.AreDetails, x => x.MapFrom(src => src));

            CreateMap<WcfPolicyService.Policy, Policy>()
                .ForMember(
                    dest => dest.PolicyPeriodDetails,
                    x => x.MapFrom(src => src.PolicyPeriods)
                )
                .ForMember(dest => dest.SnapshotDetails, x => x.MapFrom(src => src));

            CreateMap<ClaimsPolicySummaryResponse, Policy>()
                .ForMember(
                    dest => dest.Participants,
                    x => x.MapFrom(src => src.ParticipantSummaries)
                );

            CreateMap<HomebasePolicySummaryResponse, Policy>()
                .ForMember(dest => dest.PolicyNumber, x => x.MapFrom(src => src.Policy));

            //Needed?
            CreateMap<Registration, Policy>()
                .ForMember(
                    dest => dest.PolicyNumber,
                    x => x.MapFrom(src => src.PolicyParticipant.PolicyNumber)
                );

            CreateMap<PolicyDTO, SupportPolicy>();

            CreateMap<WcfPolicyService.PolicyPeriodModel, PolicyPeriod>();

            CreateMap<WcfDevice.DeviceHistory, DeviceShippingInformation>();

            CreateMap<WcfParticipantService.DeviceRecoveryItem, Resources.DeviceRecoveryItem>();

            CreateMap<WcfParticipantService.SuspensionGetItem, Resources.DeviceSuspensionItem>()
                .ForMember(dest => dest.StartDate, act => act.MapFrom(src => src.BeginDate));
        }
    }
}
