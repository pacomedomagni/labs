using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models.UbiDTO;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Services.Converters;
using System.IO;
using System.ServiceModel.Channels;

namespace Progressive.Telematics.Admin.Business.Orchestrators.Tools
{
    [SingletonService]
    public interface IPolicyHistoryOrchestrator
    {
        Task<IEnumerable<ParticipantJunction>> GetParticipantJunctionData(string policyNumber);
        Task<MemoryStream> GetParticipantJunctionDataFile(string policyNumber);
        Task<SupportPolicy> GetPolicyData(string policyNumber);
        Task<List<TransactionAuditLog>> GetAuditLogs(string policyNumber);
        Task<MemoryStream> GetAuditLogsFile(string policyNumber);
        Task<PluginDevice> GetDeviceInfo(string serialNumber);
        Task<int> GetTripRegularity(int participantSeqId);
        Task<List<TripSummaryDaily>> GetTripSummary(
            string participantId,
            int participantSeqId,
            DeviceExperience experience,
            int algorithm
        );
        Task<List<TripSummaryDaily>> GetTripSummary(int participantSeqId);
        Task<MemoryStream> GetTripSummaryFile(int participantSeqId);
        Task<List<TripSummaryDaily>> GetTripSummary(string participantId);
        Task<MemoryStream> GetTripSummaryFile(string participantId);
        Task<PagedList<TripEvent>> GetTripDetails(long tripSeqId, DateTime start, int algorithm, DeviceExperience experience, int page, int pageSize, SortOrder sortOrder = SortOrder.Unspecified, string filter = "");
        Task<MemoryStream> GetTripDetailsFile(long tripSeqId, DateTime start, int algorithm, DeviceExperience experience, int page, int pageSize, SortOrder sortOrder = SortOrder.Unspecified, string filter = "");
        Task<List<ParticipantDeviceTripEvent>> GetParticipantDeviceEvents(int participantSeqId);
        Task<MemoryStream> GetParticipantDeviceEventsFile(int participantSeqId);
        Task<MobileDevice> GetMobileDeviceInfo(int homebaseSeqId);
    }

    public class PolicyHistoryOrchestrator : IPolicyHistoryOrchestrator
    {
        private readonly ILogger<PolicyHistoryOrchestrator> _logger;
        private readonly IDeviceApi _deviceApi;
        private readonly IPolicyTripApi _policyTripApi;
        private readonly IDeviceService _deviceService;
        private readonly IValueCalculatorService _valueCalculatorService;
        private readonly IPolicyDAL _policyDb;
        private readonly ITripDetailsDAL _tripDetailsDb;
        private readonly IMapper _mapper;
        private readonly IScoringAlgorithmsOrchestrator _scoringAlgorithmsOrchestrator;

        public PolicyHistoryOrchestrator(
            ILogger<PolicyHistoryOrchestrator> logger,
            IDeviceApi deviceApi,
            IPolicyTripApi policyTripApi,
            IDeviceService deviceService,
            IValueCalculatorService valueCalculatorService,
            IPolicyDAL policyDAL,
            ITripDetailsDAL tripDetailsDAL,
            IMapper mapper,
            IScoringAlgorithmsOrchestrator scoringAlgorithmsOrchestrator)
        {
            _logger = logger;
            _deviceApi = deviceApi;
            _policyTripApi = policyTripApi;
            _deviceService = deviceService;
            _valueCalculatorService = valueCalculatorService;
            _policyDb = policyDAL;
            _tripDetailsDb = tripDetailsDAL;
            _mapper = mapper;
            _scoringAlgorithmsOrchestrator = scoringAlgorithmsOrchestrator;
        }

        public async Task<IEnumerable<ParticipantJunction>> GetParticipantJunctionData(string policyNumber)
        {
            IEnumerable<Services.Models.UbiDTO.ParticipantJunctionDTO> response = await _policyDb.GetParticipantJunctionData(policyNumber);
            IEnumerable<ParticipantJunction> data = _mapper.Map<IEnumerable<ParticipantJunction>>(response.AsEnumerable());

            data.ForEach(async participant => participant.ScoringAlgorithmData = await _scoringAlgorithmsOrchestrator.GetScoringAlgorithmByCodeAsync((int)participant.ScoringAlgorithmCode));

            return data;
        }

        public async Task<MemoryStream> GetParticipantJunctionDataFile(string policyNumber)
        {
            IEnumerable<Services.Models.UbiDTO.ParticipantJunctionDTO> response = await _policyDb.GetParticipantJunctionData(policyNumber);
            IEnumerable<ParticipantJunction> data = _mapper.Map<IEnumerable<ParticipantJunction>>(response.AsEnumerable());
            data.ForEach(async participant => participant.ScoringAlgorithmData = await _scoringAlgorithmsOrchestrator.GetScoringAlgorithmByCodeAsync((int)participant.ScoringAlgorithmCode));
            DataToCsvConverter toCsvConverter = new DataToCsvConverter();
            return toCsvConverter.ParticipantJunctionDataToCsv(data);
        }

        public async Task<SupportPolicy> GetPolicyData(string policyNumber)
        {
            var response = await _policyDb.GetSupportPolicyData(policyNumber);
            var data = _mapper.Map<SupportPolicy>(response);
            if (data == null)
                throw new TelematicsApiException(
                    _logger,
                    "Policy not found",
                    HttpStatusCode.BadRequest
                );
            return data;
        }

        public async Task<List<TransactionAuditLog>> GetAuditLogs(string policyNumber)
        {
            var data = await _policyDb.GetTransactionAuditLogs(policyNumber);
            return data;
        }

        public async Task<MemoryStream> GetAuditLogsFile(string policyNumber)
        {
            var data = await _policyDb.GetTransactionAuditLogs(policyNumber);
            DataToCsvConverter toCsvConverter = new DataToCsvConverter();
            return toCsvConverter.TransAuditLogListToCsv(data);
        }

        public async Task<PluginDevice> GetDeviceInfo(string serialNumber)
        {
            var data = await _deviceService.DeviceInformation(serialNumber);
            var model = _mapper.Map<PluginDevice>(data.Device);
            model.AddExtender("CreateDate", data.Device.CreateDate);
            model.AddExtender("FirstContact", data.Device.FirstContactDateTime);
            model.AddExtender("LastContact", data.Device.LastContactDateTime);
            model.AddExtender("LastUpload", data.Device.LastUploadDateTime);
            model.AddExtender("ImportStatus", data.Device.ImportStatus);
            model.AddExtender("LotId", data.Device.LotID);
            model.AddExtender("CalculatorVersion", data.Device.InputCalcVersion);
            return model;
        }

        public async Task<MobileDevice> GetMobileDeviceInfo(int homebaseSeqId)
        {
            var data = await _deviceApi.GetDevice(homebaseSeqId);
            var model = _mapper.Map<MobileDevice>(data);
            return model;
        }

        public async Task<int> GetTripRegularity(int participantSeqId)
        {
            dynamic data = await _valueCalculatorService.GetCalculatedValues(participantSeqId);
            return data.Score?.TripRegularity ?? 0;
        }

        public async Task<List<TripSummaryDaily>> GetTripSummary(string participantId, int participantSeqId,
            DeviceExperience experience, int algorithm)
        {
            if (algorithm == 1 || (experience == DeviceExperience.Device && (algorithm == 3 || algorithm == 4)))
            {
                return await GetTripSummary(participantSeqId);
            }

            return await GetTripSummary(participantId);
        }

        public async Task<List<TripSummaryDaily>> GetTripSummary(int participantSeqId)
        {
            var data = await _policyDb.GetTripSummary(participantSeqId);
            var model = _mapper.Map<List<TripSummaryDaily>>(data);
            return model;
        }

        public async Task<MemoryStream> GetTripSummaryFile(int participantSeqId)
        {
            var data = await _policyDb.GetTripSummary(participantSeqId);
            var model = _mapper.Map<List<TripSummaryDaily>>(data);
            DataToCsvConverter toCsvConverter = new DataToCsvConverter();
            return toCsvConverter.TripSummaryListToCsv(model);
        }

        public async Task<List<TripSummaryDaily>> GetTripSummary(string participantId)
        {
            var data = await _policyTripApi.GetTrips(participantId);
            var model = _mapper.Map<List<TripSummaryDaily>>(data.Trips);
            return model;
        }

        public async Task<MemoryStream> GetTripSummaryFile(string participantId)
        {
            var data = await _policyTripApi.GetTrips(participantId);
            var model = _mapper.Map<List<TripSummaryDaily>>(data.Trips);
            DataToCsvConverter toCsvConverter = new DataToCsvConverter();
            return toCsvConverter.TripSummaryListToCsv(model);
        }

        public async Task<List<ParticipantDeviceTripEvent>> GetParticipantDeviceEvents(int participantSeqId)
        {
            var data = await _policyDb.GetParticipantDeviceEvents(participantSeqId);
            var model = _mapper.Map<List<ParticipantDeviceTripEvent>>(data);
            return model;
        }

        public async Task<MemoryStream> GetParticipantDeviceEventsFile(int participantSeqId)
        {
            var data = await _policyDb.GetParticipantDeviceEvents(participantSeqId);
            var model = _mapper.Map<List<ParticipantDeviceTripEvent>>(data);
            DataToCsvConverter toCsvConverter = new DataToCsvConverter();
            return toCsvConverter.ParticipantDeviceDetailsListToCSV(model);
        }

        public async Task<PagedList<TripEvent>> GetTripDetails(long tripSeqId, DateTime start, int algorithm, DeviceExperience experience, int page, int pageSize, SortOrder sortOrder = SortOrder.Unspecified, string filter = "")
        {

            GetTDByTripSeqIDResponse data = null;
            List<TripEvent> tripEvents = null;
            if (experience == DeviceExperience.Mobile)
            {
                data = await _policyDb.GetTripEventDetails(tripSeqId, algorithm, filter ?? "");
                tripEvents = _mapper.Map<List<TripEvent>>(data.TripEventList);
            }
            else
            {
                data = await _tripDetailsDb.GetTripDetails(tripSeqId, start, page, pageSize, "");
                tripEvents = await GetProcessedTripEvents(tripSeqId, algorithm, filter, data);
            }
            if (sortOrder != SortOrder.Unspecified)
            {
                tripEvents = (
                    sortOrder == SortOrder.Asc
                        ? tripEvents.OrderBy(x => x.EventDate)
                        : tripEvents.OrderByDescending(x => x.EventDate)
                ).ToList();
            }
            if (!string.IsNullOrEmpty(filter))
            {
                var tripEventDetails = await _policyDb.GetTripEventDetails(tripSeqId, algorithm, filter);
                tripEvents = _mapper.Map<List<TripEvent>>(tripEventDetails.TripEventList);
                return new PagedList<TripEvent>(tripEvents, tripEvents.Count, page, pageSize);
            }

            return new PagedList<TripEvent>(tripEvents, data.TotalRecordCount, page, pageSize);
        }

        public async Task<MemoryStream> GetTripDetailsFile(long tripSeqId, DateTime start, int algorithm, DeviceExperience experience, int page, int pageSize, SortOrder sortOrder = SortOrder.Unspecified, string filter = "")
        {
            GetTDByTripSeqIDResponse data = null;
            List<TripEvent> tripEvents = null;
            if (experience == DeviceExperience.Mobile)
            {
                data = await _policyDb.GetTripEventDetails(tripSeqId, algorithm, filter ?? "");
                tripEvents = _mapper.Map<List<TripEvent>>(data.TripEventList);
            }
            else
            {
                data = await _tripDetailsDb.GetTripDetails(tripSeqId, start, page, pageSize, null);
                tripEvents = await GetProcessedTripEvents(tripSeqId, algorithm, filter, data);
            }
            if (sortOrder != SortOrder.Unspecified)
            {
                tripEvents = (
                    sortOrder == SortOrder.Asc
                        ? tripEvents.OrderBy(x => x.EventDate)
                        : tripEvents.OrderByDescending(x => x.EventDate)
                ).ToList();
            }
            DataToCsvConverter toCsvConverter = new DataToCsvConverter();

            if (!string.IsNullOrEmpty(filter))
            {
                var tripEventDetails = await _policyDb.GetTripEventDetails(tripSeqId, algorithm, filter);
                tripEvents = _mapper.Map<List<TripEvent>>(tripEventDetails.TripEventList);
                return toCsvConverter.TripEventListToCsv(new PagedList<TripEvent>(tripEvents, tripEvents.Count, page, pageSize));
            }

            return toCsvConverter.TripEventListToCsv(new PagedList<TripEvent>(tripEvents, data.TotalRecordCount, page, pageSize));
        }

        private async Task<List<TripEvent>> GetProcessedTripEvents(long tripSeqId, int algorithm, string filter, GetTDByTripSeqIDResponse data)
        {
            List<TripEvent> tripEvents = null;
            var tripEventDetails = await _policyDb.GetTripEventDetails(tripSeqId, algorithm, filter ?? "");
            if (tripEventDetails != null && tripEventDetails.TripEventList.Count > 0)
            {
                foreach (var tripEventItem in tripEventDetails.TripEventList)
                {
                    if (!string.IsNullOrEmpty(tripEventItem.EventDescription))
                    {
                        var tripDetailItem = data.TripEventList.Find(x => x.EventDateTime == tripEventItem.EventDateTime);
                        if (tripDetailItem != null)
                        {
                            tripDetailItem.EventDescription = tripEventItem.EventDescription;
                        }
                    }
                }
            }

            tripEvents = _mapper.Map<List<TripEvent>>(data.TripEventList);
            return tripEvents;
        }
    }
 }
