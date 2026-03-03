using System;
using AutoMapper;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Services.Models.UbiDTO;

namespace Progressive.Telematics.Admin.Business.Mappers
{
    public class SnapshotMappers : Profile
    {
        public SnapshotMappers()
        {
            CreateMap<WcfPolicyService.BillingTransaction, BillingTransaction>()
                .ForMember(dest => dest.DeviceSeqId, x => x.MapFrom(src => src.DeviceSeqID));

            CreateMap<WcfPolicyService.CommunicationItem, Communication>()
                .ForMember(
                    dest => dest.ParticipantSeqId,
                    x => x.MapFrom(src => src.ParticipantSeqID)
                );

            CreateMap<WcfPolicyService.Participant, OptOutData>()
                .ForMember(dest => dest.Date, x => x.MapFrom(src => src.OptOutDate))
                .ForMember(
                    dest => dest.Reason,
                    x =>
                        x.MapFrom(
                            src =>
                                Enum.Parse(
                                    typeof(OptOutReasonCode),
                                    src.OptOutReasonDescription.Replace(" ", string.Empty),
                                    true
                                )
                        )
                )
                .ForMember(
                    dest => dest.ReasonDescription,
                    x => x.MapFrom(src => src.OptOutReasonDescription)
                );

            CreateMap<WcfParticipantService.OptOutSuspensionData, OptOutSuspension>()
                .ForMember(dest => dest.SeqId, x => x.MapFrom(src => src.OptOutSuspensionSeqID))
                .ForMember(dest => dest.ReasonCode, x => x.MapFrom(src => src.SuspensionReasonID))
                .ForMember(dest => dest.DeviceSeqId, x => x.MapFrom(src => src.DeviceSeqID))
                .ForMember(dest => dest.IsReturned, x => x.MapFrom(src => src.IsDeviceReturned))
                .ForMember(dest => dest.StartDate, x => x.MapFrom(src => src.BeginDate));

            CreateMap<
                WcfValueCalculator.GetValueCalculatorValuesResponse,
                ParticipantCalculatedValues
            >()
                .ForMember(
                    dest => dest.ParticipantSeqId,
                    x => x.MapFrom(src => src.ParticipantSeqID)
                )
                .ForMember(
                    dest => dest.ConnectedSeconds,
                    x => x.MapFrom(src => src.Connectivity.ConnectedSeconds)
                )
                .ForMember(
                    dest => dest.DisconnectCount,
                    x => x.MapFrom(src => src.Connectivity.DisconnectCount)
                )
                .ForMember(
                    dest => dest.DisconnectedSeconds,
                    x => x.MapFrom(src => src.Connectivity.DisconnectedSeconds)
                )
                .ForMember(dest => dest.UBIScore, x => x.MapFrom(src => src.Score.UBIScore))
                .ForMember(dest => dest.UBIValue, x => x.MapFrom(src => src.Score.UBIValue));

            CreateMap<WcfParticipantService.RenewalScoreItem, ParticipantCalculatedRenewalValues>()
                .ForMember(
                    dest => dest.ConnectedSeconds,
                    x => x.MapFrom(src => src.AdjustedConnectSecs)
                )
                .ForMember(dest => dest.EndDate, x => x.MapFrom(src => src.CalcEndDate))
                .ForMember(dest => dest.StartDate, x => x.MapFrom(src => src.CalcStartDate));

            CreateMap<WcfParticipantService.Score, ParticipantCalculatedRenewalValues>()
                .ForMember(
                    dest => dest.ConnectedSeconds,
                    x => x.MapFrom(src => src.AdjustedConnectSecs)
                )
                .ForMember(dest => dest.EndDate, x => x.MapFrom(src => src.CalcEndDate))
                .ForMember(dest => dest.StartDate, x => x.MapFrom(src => src.CalcStartDate));

            CreateMap<WcfParticipantService.InProcessItem, ParticipantCalculatedInitialValues>()
                .ForMember(
                    dest => dest.BeginScoreCheckDate,
                    x => x.MapFrom(src => src.BeginScoreCheckDateTime)
                )
                .ForMember(
                    dest => dest.EndorsementAppliedDate,
                    x => x.MapFrom(src => src.EndorsementAppliedDateTime)
                )
                .ForMember(
                    dest => dest.LastUpdateDate,
                    x => x.MapFrom(src => src.LastUpdateDateTime)
                );

            CreateMap<ParticipantJunctionDTO, ParticipantJunction>();

            CreateMap<WcfPolicyService.Participant, PluginDevice>();

            CreateMap<WcfDevice.Device, PluginDevice>()
                .ForMember(dest => dest.Status, x => x.MapFrom(src => src.DeviceStatus))
                .ForMember(
                    dest => dest.DeviceVersion,
                    x => x.MapFrom(src => src.DeviceVersionSeqID)
                );

            CreateMap<WcfXirgoService.GetDeviceInfoResponse, DeviceFirmwareDetails>();

            CreateMap<WcfXirgoService.GetDeviceInfoResponse, PluginDevice>()
                .ForMember(
                    dest => dest.LastRemoteResetDateTime,
                    x =>
                        x.MapFrom(
                            src =>
                                !string.IsNullOrWhiteSpace(src.LastRemoteResetDateTime)
                                    ? src.LastRemoteResetDateTime
                                    : null
                        )
                )
                .AfterMap(
                    (src, dest) =>
                    {
                        if (dest.LastRemoteResetDateTime == DateTime.MinValue)
                            dest.LastRemoteResetDateTime = null;
                    }
                );

            CreateMap<WcfXirgoService.XirgoDevice, PluginDevice>()
                .AfterMap(
                    (src, dest) =>
                    {
                        dest.AddExtender("ProgramCode", src.ProgramCode);
                        dest.AddExtender("IsSIMActive", src.IsSimActive.Value ? true : false);
                        dest.AddExtender(
                            "SIMStatus",
                            src.IsSimActive.Value ? "Active" : "InActive"
                        );
                    }
                );

            CreateMap<WcfPolicyService.Participant, SnapshotParticipantDetails>()
                .ForMember(
                    dest => dest.ParticipantSeqId,
                    x => x.MapFrom(src => src.ParticipantSeqID)
                )
                .ForMember(dest => dest.ParticipantId, x => x.MapFrom(src => src.ParticipantID))
                .ForMember(
                    dest => dest.EnrollmentExperience,
                    x => x.MapFrom(src => src.DeviceExperienceTypeCode)
                )
                .ForMember(
                    dest => dest.BillingTransactions,
                    opt =>
                    {
                        opt.PreCondition(src => src.BillingTransactions?.Length > 0);
                        opt.MapFrom(src => src.BillingTransactions);
                    }
                )
                .ForMember(
                    dest => dest.OptOutDetails,
                    opt =>
                    {
                        opt.PreCondition(
                            src =>
                                src.OptOutDate != null
                                || !string.IsNullOrEmpty(src.OptOutReasonDescription)
                        );
                        opt.MapFrom(src => src);
                    }
                )
                .ForMember(
                    dest => dest.VehicleDetails,
                    opt =>
                    {
                        opt.PreCondition(
                            src =>
                                !string.IsNullOrEmpty(src.ModelYear)
                                && !string.IsNullOrEmpty(src.Make)
                        );
                        opt.MapFrom(src => src);
                    }
                );

            CreateMap<WcfPolicyService.Policy, SnapshotPolicyDetails>()
                .ForMember(dest => dest.AppInfo, x => x.MapFrom(src => src))
                .ForMember(dest => dest.MailingAddress, x => x.MapFrom(src => src));

            CreateMap<DailyTotal, TripSummaryDaily>()
                .ForMember(dest => dest.HardBrakes, x => x.MapFrom(src => src.HardBrakeTotal))
                .ForMember(
                    dest => dest.HardAccelerations,
                    x => x.MapFrom(src => src.HardAccelerationTotal)
                )
                .ForMember(
                    dest => dest.HighRiskSeconds,
                    x => x.MapFrom(src => src.HighRiskSecondsTotal)
                )
                .ForMember(
                    dest => dest.Mileage,
                    x => x.MapFrom(src => (decimal)src.TripMileageTotal)
                )
                .ForMember(dest => dest.TripCount, x => x.MapFrom(src => src.TripTotal))
                .ForMember(
                    dest => dest.TripDate,
                    x => x.MapFrom(src => Convert.ToDateTime(src.Date))
                )
                .ForMember(
                    dest => dest.Duration,
                    x => x.MapFrom(src => TimeSpan.FromSeconds(src.TripDurationTotalSeconds))
                )
                .ForMember(
                    dest => dest.DistractedDrivingInfo,
                    opt =>
                    {
                        opt.PreCondition(
                            src =>
                                src.ApplicationUsageHandsFreeTotalSeconds.HasValue
                                || src.ApplicationUsageInHandTotalSeconds.HasValue
                                || src.PhoneUsageHandsFreeTotalSeconds.HasValue
                                || src.PhoneUsageInHandTotalSeconds.HasValue
                        );
                        opt.MapFrom(src => src);
                    }
                );

            CreateMap<TripSummaryDTO, TripSummaryDaily>()
                .ForMember(dest => dest.SeqId, x => x.MapFrom(src => src.TripSeqID))
                .ForMember(
                    dest => dest.HardAccelerations,
                    x => x.MapFrom(src => src.HardAccelerationsV2)
                )
                .ForMember(dest => dest.HardBrakes, x => x.MapFrom(src => src.HardBrakesV2))
                .ForMember(dest => dest.HighRiskSeconds, x => x.MapFrom(src => src.HighRiskSeconds))
                .ForMember(dest => dest.TripDate, x => x.MapFrom(src => src.TripStartTime))
                .ForMember(dest => dest.TripEndDate, x => x.MapFrom(src => src.TripEndTime))
                .ForMember(
                    dest => dest.Duration,
                    x => x.MapFrom(src => src.TripEndTime - src.TripStartTime)
                )
                .ForMember(dest => dest.ExtremeHardBrakes, x => x.MapFrom(src => src.ExtremeBrakes))
                .ForMember(dest => dest.Mileage, x => x.MapFrom(src => src.TripMileage))
                .AfterMap(
                    (src, dest) =>
                    {
                        dest.AddExtender("MaxSpeed", src.MaxSpeed);
                    }
                );

            CreateMap<Trip, TripSummaryDaily>()
                .ForMember(dest => dest.SeqId, x => x.MapFrom(src => long.Parse(src.TripId)))
                .ForMember(
                    dest => dest.HardAccelerations,
                    x => x.MapFrom(src => src.TotalHardAccelerations)
                )
                .ForMember(dest => dest.HardBrakes, x => x.MapFrom(src => src.TotalHardBrakes))
                .ForMember(dest => dest.HighRiskSeconds, x => x.MapFrom(src => src.HighRiskSeconds))
                .ForMember(dest => dest.TripDate, x => x.MapFrom(src => src.StartDateTime))
                .ForMember(dest => dest.TripEndDate, x => x.MapFrom(src => src.EndDateTime))
                .ForMember(
                    dest => dest.Duration,
                    x => x.MapFrom(src => src.EndDateTime - src.StartDateTime)
                )
                .ForMember(dest => dest.Mileage, x => x.MapFrom(src => src.Mileage))
                .ForMember(
                    dest => dest.DistractedDrivingInfo,
                    opt =>
                    {
                        opt.PreCondition(
                            src =>
                                src.AppHandsFreeUsageSeconds.HasValue
                                || src.AppInHandUsageSeconds.HasValue
                                || src.PhoneHandsFreeUsageSeconds.HasValue
                                || src.PhoneInHandUsageSeconds.HasValue
                        );
                        opt.MapFrom(src => src);
                    }
                );

            CreateMap<WcfDrivingDailyAggregateService.DailyDrivingAggregate, TripSummaryDaily>()
                .ForMember(
                    dest => dest.Duration,
                    x => x.MapFrom(src => TimeSpan.FromSeconds(src.TripDuration))
                )
                .ForMember(dest => dest.Mileage, x => x.MapFrom(src => src.TripMileage));

            CreateMap<DailyTotal, TripSummaryDistractedDriving>()
                .ForMember(
                    dest => dest.ApplicationUsageHandsFree,
                    x => x.MapFrom(src => src.ApplicationUsageHandsFreeTotalSeconds ?? 0)
                )
                .ForMember(
                    dest => dest.ApplicationUsageInHand,
                    x => x.MapFrom(src => src.ApplicationUsageInHandTotalSeconds ?? 0)
                )
                .ForMember(
                    dest => dest.PhoneUsageHandsFree,
                    x => x.MapFrom(src => src.PhoneUsageHandsFreeTotalSeconds ?? 0)
                )
                .ForMember(
                    dest => dest.PhoneUsageInHand,
                    x => x.MapFrom(src => src.PhoneUsageInHandTotalSeconds ?? 0)
                );

            CreateMap<Trip, TripSummaryDistractedDriving>()
                .ForMember(
                    dest => dest.ApplicationUsageHandsFree,
                    x => x.MapFrom(src => src.AppHandsFreeUsageSeconds)
                )
                .ForMember(
                    dest => dest.ApplicationUsageInHand,
                    x => x.MapFrom(src => src.AppInHandUsageSeconds)
                )
                .ForMember(
                    dest => dest.PhoneUsageHandsFree,
                    x => x.MapFrom(src => src.PhoneHandsFreeUsageSeconds)
                )
                .ForMember(
                    dest => dest.PhoneUsageInHand,
                    x => x.MapFrom(src => src.PhoneInHandUsageSeconds)
                );

            CreateMap<TripEventDTO, Resources.TripEvent>()
                .ForMember(dest => dest.Description, x => x.MapFrom(src => src.EventDescription))
                .ForMember(dest => dest.EventDate, x => x.MapFrom(src => src.EventDateTime))
                .ForMember(dest => dest.Speed, x => x.MapFrom(src => src.Speed));

            CreateMap<EventDTO, Resources.ParticipantDeviceTripEvent>()
                .ForMember(dest => dest.ProtocolCode, x => x.MapFrom(src => (int?)src.ProtocolCode))
                .ForMember(dest => dest.EventSeqId, x => x.MapFrom(src => src.EventSeqID));

            CreateMap<EventDTO, Resources.ParticipantDeviceTripEvent>()
                .ForMember(dest => dest.ProtocolCode, x => x.MapFrom(src => (int?)src.ProtocolCode))
                .ForMember(dest => dest.EventSeqId, x => x.MapFrom(src => src.EventSeqID));

            CreateMap<Registration, Vehicle>();

            CreateMap<WcfPolicyService.Participant, Vehicle>()
                .ForMember(dest => dest.Year, x => x.MapFrom(src => src.ModelYear));

            CreateMap<PolicyMobileDataModel, Vehicle>()
                .ForMember(dest => dest.Year, x => x.MapFrom(src => src.ModelYear));
        }
    }
}
