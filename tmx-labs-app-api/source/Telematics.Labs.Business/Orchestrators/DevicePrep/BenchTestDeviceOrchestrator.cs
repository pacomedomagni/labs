using System;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfTestService = BenchTestServices;

namespace Progressive.Telematics.Labs.Business.Orchestrators.DevicePrep
{
    [SingletonService]
    public interface IBenchTestDeviceOrchestrator
    {
        Task<ValidateDeviceForBenchTestResponse> ValidateDeviceForBenchTest(ValidateDeviceForBenchTestRequest request);
        Task<BenchTestBoardDeviceCollectionResponse> GetAllDevicesByBoard(GetAllDevicesByBoardRequest request);
        Task<BenchTestBoardStatusResponse> GetAllDeviceStatusesByBoard(GetAllDevicesByBoardRequest request);
        Task<AddDeviceToBoardResponse> SaveDeviceToBoard(int boardId, BenchTestBoardDevice device);
        Task<DeleteDeviceFromBoardResponse> DeleteDeviceFromBoard(int boardId, int locationOnBoard);
    }

    public class BenchTestDeviceOrchestrator : IBenchTestDeviceOrchestrator
    {
        private readonly IXirgoDeviceService _xirgoDeviceService;
        private readonly IBenchTestBoardService _benchTestBoardService;
        private readonly IBenchTestDeviceDAL _benchTestDeviceDAL;
        private readonly IBenchTestDeviceStatusDAL _benchTestDeviceStatusDAL;
        private readonly IBenchTestService _benchTestService;
        private readonly ILogger<BenchTestDeviceOrchestrator> _logger;


        public BenchTestDeviceOrchestrator(
            IXirgoDeviceService xirgoDeviceService,
            IBenchTestBoardService benchTestBoardService,
            IBenchTestDeviceDAL benchTestDeviceDAL,
            IBenchTestDeviceStatusDAL benchTestDeviceStatusDAL,
            IBenchTestService benchTestService,
            ILogger<BenchTestDeviceOrchestrator> logger)
        {
            _xirgoDeviceService = xirgoDeviceService;
            _benchTestBoardService = benchTestBoardService;
            _benchTestDeviceDAL = benchTestDeviceDAL;
            _benchTestDeviceStatusDAL = benchTestDeviceStatusDAL;
            _benchTestService = benchTestService;
            _logger = logger;
        }

        public async Task<ValidateDeviceForBenchTestResponse> ValidateDeviceForBenchTest(ValidateDeviceForBenchTestRequest request)
        {
            var response = new ValidateDeviceForBenchTestResponse();

            if (string.IsNullOrWhiteSpace(request?.DeviceId))
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Device ID is required");
                return response;
            }

            var deviceResult = await _xirgoDeviceService.GetDeviceBySerialNumber(request.DeviceId);

            if (deviceResult?.Device == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "DeviceNotFound");
                response.AddMessage(MessageCode.ErrorDetails, $"Device with ID '{request.DeviceId}' not found");
                return response;
            }

            response.SimActive = deviceResult.Device.IsSimActive ?? true;
            response.IsAssigned = (deviceResult.Device.StatusCode.HasValue && deviceResult.Device.StatusCode.Value == (int)DeviceStatus.Assigned);

            return response;
        }

        public async Task<BenchTestBoardDeviceCollectionResponse> GetAllDevicesByBoard(GetAllDevicesByBoardRequest request)
        {
            var response = new BenchTestBoardDeviceCollectionResponse();

            if (request.BoardId <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid BoardId is required");
                return response;
            }

            var devices = await _benchTestDeviceDAL.GetAllDevicesByBoardId(request.BoardId);

            response.Devices = devices?.Select(d => new BenchTestBoardDevice
            {
                DeviceSerialNumber = d.DeviceSerialNumber,
                DeviceLocationOnBoard = d.DeviceLocationOnBoard
            }).ToArray() ?? Array.Empty<BenchTestBoardDevice>();

            response.ResultCount = response.Devices.Length;
            response.AddMessage(MessageCode.StatusDescription, $"Retrieved {response.ResultCount} devices for board {request.BoardId}");

            return response;
        }

        public async Task<BenchTestBoardStatusResponse> GetAllDeviceStatusesByBoard(GetAllDevicesByBoardRequest request)
        {
            var response = new BenchTestBoardStatusResponse();

            if (request.BoardId <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid BoardId is required");
                return response;
            }

            var board = await _benchTestBoardService.GetBenchTestBoard(request.BoardId);
            response.BoardStatus = board?.BenchTestBoard.StatusCode ?? 0;

            // First make sure bench test is complete before reporting board status
            var result = await _benchTestService.StopIfCompleteBenchTest(request.BoardId);

            if (result.ResponseStatus == WcfTestService.ResponseStatus.Failure)
            {
                foreach (var error in result.ResponseErrors ?? Array.Empty<WcfTestService.ResponseError>())
                {
                    // Report error if we can't stop the bench test, but let status reporting still happen
                    response.AddMessage(MessageCode.Error, error.Message);
                }
            }

            var deviceStatuses = await _benchTestDeviceStatusDAL.GetAllDeviceStatusesByBoard(request.BoardId);

            response.DeviceStatuses = deviceStatuses?.Select(d => new BenchTestBoardDeviceStatus
            {
                BoardID = d.BoardID,
                DeviceSerialNumber = d.DeviceSerialNumber,
                BenchTestStatusCode = d.BenchTestStatusCode,
                Description = d.Description,
                DisplayPercent = d.DisplayPercent
            }).ToArray() ?? Array.Empty<BenchTestBoardDeviceStatus>();


            return response;
        }

        public async Task<AddDeviceToBoardResponse> SaveDeviceToBoard(int boardId, BenchTestBoardDevice device)
        {
            var response = new AddDeviceToBoardResponse();

            if (device == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid Device is required");
                return response;
            }

            if (string.IsNullOrWhiteSpace(device.DeviceSerialNumber))
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "DeviceSerialNumber is required");
                return response;
            }

            var existingDevices = await _benchTestDeviceDAL.GetAllDevicesByBoardId(boardId);
            var deviceAtLocation = existingDevices.FirstOrDefault(t => t.DeviceLocationOnBoard == device.DeviceLocationOnBoard);

            if(deviceAtLocation?.DeviceSerialNumber == device.DeviceSerialNumber)
            {
                response.AddMessage(MessageCode.StatusDescription, $"Device already saved to this location");
            }
            else if (deviceAtLocation != null)
            {
                await _benchTestDeviceDAL.UpdateBoardDevice(boardId, device);
                response.AddMessage(MessageCode.StatusDescription, $"BoardId {boardId} updated at location {device.DeviceLocationOnBoard} with device {device.DeviceSerialNumber}");
            }
            else
            {
                await _benchTestDeviceDAL.AddDeviceToBoard(boardId, device);
                response.AddMessage(MessageCode.StatusDescription, $"Device {device.DeviceSerialNumber} added to board {boardId}");
            }


            return response;
        }

        public async Task<DeleteDeviceFromBoardResponse> DeleteDeviceFromBoard(int boardId, int locationOnBoard)
        {
            var response = new DeleteDeviceFromBoardResponse();

            if (boardId <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid BoardId is required");
                return response;
            }

            if (locationOnBoard <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid LocationOnBoard is required");
                return response;
            }

            await _benchTestDeviceDAL.DeleteDeviceFromBoard(boardId, locationOnBoard);
            response.AddMessage(MessageCode.StatusDescription, $"Device deleted from board {boardId} at location {locationOnBoard}");

            return response;
        }
    }
}
