using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DeepEqual.Syntax;
using Microsoft.EntityFrameworkCore;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Database.CommercialLines;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Services.Models.ClTables;

namespace Progressive.Telematics.Admin.Business.Mappers;

public class CommercialMapper : Profile
{
    public CommercialMapper()
    {
        CreateMap<Services.Models.ClTables.Policy, CommercialPolicy>()
            .ForMember(
                dest => dest.Address,
                x =>
                    x.MapFrom<CommercialAddress>(
                        src =>
                            new CommercialAddress
                            {
                                ContactName = src.Name,
                                Address1 = src.Address1,
                                Address2 = src.Address2,
                                City = src.City,
                                State = src.State,
                                PostalCode = src.ZipCode
                            }
                    )
            );

        CreateMap<Services.Models.ClTables.Policy, CommercialAddress>()
            .ForMember(dest => dest.ContactName, x => x.MapFrom(src => src.Name))
            .ForMember(dest => dest.Address1, x => x.MapFrom(src => src.Address1))
            .ForMember(dest => dest.Address2, x => x.MapFrom(src => src.Address2))
            .ForMember(dest => dest.City, x => x.MapFrom(src => src.City))
            .ForMember(dest => dest.State, x => x.MapFrom(src => src.State))
            .ForMember(dest => dest.PostalCode, x => x.MapFrom(src => src.ZipCode));

        CreateMap<Services.Models.ClTables.Participant, CommercialParticipant>();

        CreateMap<
            Services.Models.ClTables.Participant,
            Services.Models.ClTables.ParticipantHistory
        >()
            .ForMember(dest => dest.ParticipantSeqId, x => x.MapFrom(src => src.ParticipantSeqId))
            .ForMember(dest => dest.PolicySeqId, x => x.MapFrom(src => src.PolicySeqId))
            .ForMember(dest => dest.VehicleSeqId, x => x.MapFrom(src => src.VehicleSeqId))
            .ForMember(dest => dest.DeviceSeqId, x => x.MapFrom(src => src.DeviceSeqId))
            .ForMember(
                dest => dest.ParticipantStatusCode,
                x => x.MapFrom(src => src.ParticipantStatusCode)
            )
            .ForMember(
                dest => dest.LastUpdateDateTime,
                x => x.MapFrom(src => src.LastUpdateDateTime)
            )
            .ForMember(
                dest => dest.DeviceExperienceTypeCode,
                x => x.MapFrom(src => src.DeviceExperienceTypeCode)
            )
            .ForMember(dest => dest.ParticipantId, x => x.MapFrom(src => src.ParticipantId))
            .ForMember(
                dest => dest.DashboardEnrollmentDateTime,
                x => x.MapFrom(src => src.DashboardEnrollmentDateTime)
            )
            .ForMember(dest => dest.CreateDateTime, x => x.MapFrom(src => DateTime.Now));

        CreateMap<DeviceOrderDto, Services.Models.ClTables.DeviceOrder>();
        CreateMap<DeviceOrderDetailDto, Services.Models.ClTables.DeviceOrderDetail>()
            .ForMember(dest => dest.DeviceOrderSeqId, x => x.MapFrom(src => src.DeviceOrderId));
    }
}
