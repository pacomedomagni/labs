using System;
using System.Threading.Tasks;
using Moq;
using Progressive.Telematics.Labs.Business.Orchestrators.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest;
using Xunit;
using WcfBoardService = BenchTestBoardService;
using WcfTestService = BenchTestServices;

namespace Progressive.Telematics.Labs.Business.Tests.DevicePrep
{
    public class BenchTestOrchestratorTests : TestBase<BenchTestOrchestrator, IBenchTestOrchestrator>
    {
        public BenchTestOrchestratorTests()
        {
            Orchestrator = new BenchTestOrchestrator(
                Services.BenchTestBoard.Object,
                Services.BenchTest.Object,
                Logger.Object);
        }

        #region AddBenchTestBoard Tests

        [Fact]
        public async Task AddBenchTestBoard_WithValidBoard_ReturnsSuccess()
        {
            // Arrange
            var request = new AddBenchTestBoardRequest
            {
                Board = new BenchTestBoard
                {
                    Name = "Test Board",
                    LocationCode = 1,
                    StatusCode = 1,
                    UserID = "TestUser"
                }
            };

            // Mock the service response
            Services.BenchTestBoard.Setup(s => s.AddBenchTestBoard(It.IsAny<WcfBoardService.BenchTestBoard>()))
                .ReturnsAsync(new WcfBoardService.AddBenchTestBoardResponse
                {
                    ResponseStatus = WcfBoardService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfBoardService.ResponseError>()
                });

            // Act
            var result = await Orchestrator.AddBenchTestBoard(request);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Board);
            Assert.Equal("Test Board", result.Board.Name);
            Assert.True(result.Messages.ContainsKey(MessageCode.StatusDescription));
        }

        [Fact]
        public async Task AddBenchTestBoard_WithNullRequest_ReturnsError()
        {
            // Act
            var result = await Orchestrator.AddBenchTestBoard(null);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
        }

        [Fact]
        public async Task AddBenchTestBoard_WithNullBoard_ReturnsError()
        {
            // Arrange
            var request = new AddBenchTestBoardRequest { Board = null };

            // Act
            var result = await Orchestrator.AddBenchTestBoard(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorDetails));
            Assert.Equal("Board information is required", result.Messages[MessageCode.ErrorDetails]);
        }

        #endregion

        #region UpdateBenchTestBoard Tests

        [Fact]
        public async Task UpdateBenchTestBoard_WithValidBoard_ReturnsSuccess()
        {
            // Arrange
            var request = new UpdateBenchTestBoardRequest
            {
                Board = new BenchTestBoard
                {
                    BoardID = 1,
                    Name = "Updated Board",
                    LocationCode = 1,
                    StatusCode = 2
                }
            };

            // Mock the service response
            Services.BenchTestBoard.Setup(s => s.UpdateBenchTestBoard(It.IsAny<WcfBoardService.BenchTestBoard>()))
                .ReturnsAsync(new WcfBoardService.UpdateBenchTestBoardResponse
                {
                    ResponseStatus = WcfBoardService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfBoardService.ResponseError>()
                });

            // Act
            var result = await Orchestrator.UpdateBenchTestBoard(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.StatusDescription));
            Assert.Equal("Bench test board updated successfully", result.Messages[MessageCode.StatusDescription]);
        }

        [Fact]
        public async Task UpdateBenchTestBoard_WithNullRequest_ReturnsError()
        {
            // Act
            var result = await Orchestrator.UpdateBenchTestBoard(null);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
        }

        [Fact]
        public async Task UpdateBenchTestBoard_WithNullBoard_ReturnsError()
        {
            // Arrange
            var request = new UpdateBenchTestBoardRequest { Board = null };

            // Act
            var result = await Orchestrator.UpdateBenchTestBoard(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
        }

        #endregion

        #region DeleteBenchTestBoard Tests

        [Fact]
        public async Task DeleteBenchTestBoard_WithValidBoardId_ReturnsSuccess()
        {
            // Arrange
            var request = new DeleteBenchTestBoardRequest { BoardId = 1 };

            // Mock the service response
            Services.BenchTestBoard.Setup(s => s.DeleteBenchTestBoard(It.IsAny<int>()))
                .ReturnsAsync(new WcfBoardService.DeleteBenchTestBoardResponse
                {
                    ResponseStatus = WcfBoardService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfBoardService.ResponseError>()
                });

            // Act
            var result = await Orchestrator.DeleteBenchTestBoard(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.StatusDescription));
            Assert.Equal("Bench test board deleted successfully", result.Messages[MessageCode.StatusDescription]);
        }

        [Fact]
        public async Task DeleteBenchTestBoard_WithZeroBoardId_ReturnsError()
        {
            // Arrange
            var request = new DeleteBenchTestBoardRequest { BoardId = 0 };

            // Act
            var result = await Orchestrator.DeleteBenchTestBoard(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorDetails));
            Assert.Equal("Valid BoardId is required", result.Messages[MessageCode.ErrorDetails]);
        }

        [Fact]
        public async Task DeleteBenchTestBoard_WithNegativeBoardId_ReturnsError()
        {
            // Arrange
            var request = new DeleteBenchTestBoardRequest { BoardId = -1 };

            // Act
            var result = await Orchestrator.DeleteBenchTestBoard(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
        }

        #endregion

        #region GetBenchTestBoard Tests

        [Fact]
        public async Task GetBenchTestBoard_WithValidBoardId_ReturnsSuccess()
        {
            // Arrange
            var request = new GetBenchTestBoardRequest { BoardId = 1 };

            // Mock the service response
            Services.BenchTestBoard.Setup(s => s.GetBenchTestBoard(It.IsAny<int>()))
                .ReturnsAsync(new WcfBoardService.GetBenchTestBoardResponse
                {
                    ResponseStatus = WcfBoardService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfBoardService.ResponseError>(),
                    BenchTestBoard = new WcfBoardService.BenchTestBoard
                    {
                        BoardID = 1,
                        Name = "Test Board",
                        LocationCode = 1,
                        StatusCode = 1
                    }
                });

            // Act
            var result = await Orchestrator.GetBenchTestBoard(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.StatusDescription));
            Assert.Equal("Bench test board retrieved successfully", result.Messages[MessageCode.StatusDescription]);
        }

        [Fact]
        public async Task GetBenchTestBoard_WithZeroBoardId_ReturnsError()
        {
            // Arrange
            var request = new GetBenchTestBoardRequest { BoardId = 0 };

            // Act
            var result = await Orchestrator.GetBenchTestBoard(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
        }

        #endregion

        #region GetAllBoardsByLocation Tests

        [Fact]
        public async Task GetAllBoardsByLocation_WithValidLocationCode_ReturnsSuccess()
        {
            // Arrange
            var request = new GetAllBoardsByLocationRequest { LocationCode = 1 };

            // Mock the service response
            Services.BenchTestBoard.Setup(s => s.GetAllBoardsByLocation(It.IsAny<int>()))
                .ReturnsAsync(new WcfBoardService.GetAllBoardsByLocationResponse
                {
                    ResponseStatus = WcfBoardService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfBoardService.ResponseError>(),
                    BenchTestBoards = Array.Empty<WcfBoardService.BenchTestBoard>(),
                    resultCount = 0
                });

            // Act
            var result = await Orchestrator.GetAllBoardsByLocation(request);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Boards);
            Assert.Equal(0, result.ResultCount);
            Assert.True(result.Messages.ContainsKey(MessageCode.StatusDescription));
        }

        [Fact]
        public async Task GetAllBoardsByLocation_WithZeroLocationCode_ReturnsError()
        {
            // Arrange
            var request = new GetAllBoardsByLocationRequest { LocationCode = 0 };

            // Act
            var result = await Orchestrator.GetAllBoardsByLocation(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorDetails));
            Assert.Equal("Valid LocationCode is required", result.Messages[MessageCode.ErrorDetails]);
        }

        [Fact]
        public async Task GetAllBoardsByLocation_WithNegativeLocationCode_ReturnsError()
        {
            // Arrange
            var request = new GetAllBoardsByLocationRequest { LocationCode = -1 };

            // Act
            var result = await Orchestrator.GetAllBoardsByLocation(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
        }

        #endregion

        #region AddBenchTest Tests

        [Fact]
        public async Task AddBenchTest_WithValidTest_ReturnsSuccess()
        {
            // Arrange
            var request = new AddBenchTestRequest
            {
                BenchTest = new BenchTest
                {
                    BoardID = 1,
                    UserID = "TestUser",
                    ForceUpdate = false,
                    BenchTestItemList = new[]
                    {
                        new BenchTestItemList
                        {
                            DeviceSerialNumber = "SN123",
                            FirmwareSetCode = 1,
                            LocationOnBoard = 1
                        }
                    }
                }
            };

            // Mock the service response
            Services.BenchTest.Setup(s => s.AddBenchTest(It.IsAny<WcfTestService.BenchTest>()))
                .ReturnsAsync(new WcfTestService.AddBenchTestResponse
                {
                    ResponseStatus = WcfTestService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfTestService.ResponseError>()
                });

            // Act
            var result = await Orchestrator.AddBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.StatusDescription));
            Assert.Equal("Bench test added successfully", result.Messages[MessageCode.StatusDescription]);
        }

        [Fact]
        public async Task AddBenchTest_WithNullRequest_ReturnsError()
        {
            // Act
            var result = await Orchestrator.AddBenchTest(null);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
        }

        [Fact]
        public async Task AddBenchTest_WithNullBenchTest_ReturnsError()
        {
            // Arrange
            var request = new AddBenchTestRequest { BenchTest = null };

            // Act
            var result = await Orchestrator.AddBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorDetails));
            Assert.Equal("Bench test information is required", result.Messages[MessageCode.ErrorDetails]);
        }

        #endregion

        #region StopBenchTest Tests

        [Fact]
        public async Task StopBenchTest_WithValidBoardId_ReturnsSuccess()
        {
            // Arrange
            var request = new StopBenchTestRequest { BoardId = 1 };

            // Mock the service response
            Services.BenchTest.Setup(s => s.StopBenchTest(It.IsAny<int>()))
                .ReturnsAsync(new WcfTestService.StopBenchTestResponse
                {
                    ResponseStatus = WcfTestService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfTestService.ResponseError>()
                });

            // Act
            var result = await Orchestrator.StopBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.StatusDescription));
            Assert.Equal("Bench test stopped successfully", result.Messages[MessageCode.StatusDescription]);
        }

        [Fact]
        public async Task StopBenchTest_WithZeroBoardId_ReturnsError()
        {
            // Arrange
            var request = new StopBenchTestRequest { BoardId = 0 };

            // Act
            var result = await Orchestrator.StopBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
        }

        [Fact]
        public async Task StopBenchTest_WithNegativeBoardId_ReturnsError()
        {
            // Arrange
            var request = new StopBenchTestRequest { BoardId = -5 };

            // Act
            var result = await Orchestrator.StopBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorDetails));
            Assert.Equal("Valid BoardId is required", result.Messages[MessageCode.ErrorDetails]);
        }

        #endregion

        #region ClearBenchTest Tests

        [Fact]
        public async Task ClearBenchTest_WithValidBoardId_ReturnsSuccess()
        {
            // Arrange
            var request = new ClearBenchTestRequest { BoardId = 1 };

            // Mock the service response
            Services.BenchTest.Setup(s => s.ClearBenchTest(It.IsAny<int>()))
                .ReturnsAsync(new WcfTestService.ClearBenchTestResponse
                {
                    ResponseStatus = WcfTestService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfTestService.ResponseError>()
                });

            // Act
            var result = await Orchestrator.ClearBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.StatusDescription));
            Assert.Equal("Bench test cleared successfully", result.Messages[MessageCode.StatusDescription]);
        }

        [Fact]
        public async Task ClearBenchTest_WithZeroBoardId_ReturnsError()
        {
            // Arrange
            var request = new ClearBenchTestRequest { BoardId = 0 };

            // Act
            var result = await Orchestrator.ClearBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorDetails));
            Assert.Equal("Valid BoardId is required", result.Messages[MessageCode.ErrorDetails]);
        }

        #endregion

        #region StopIfCompleteBenchTest Tests

        [Fact]
        public async Task StopIfCompleteBenchTest_WithValidBoardId_ReturnsSuccess()
        {
            // Arrange
            var request = new StopIfCompleteBenchTestRequest { BoardId = 1 };

            // Mock the service response
            Services.BenchTest.Setup(s => s.StopIfCompleteBenchTest(It.IsAny<int>()))
                .ReturnsAsync(new WcfTestService.StopIfCompleteBenchTestResponse
                {
                    ResponseStatus = WcfTestService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfTestService.ResponseError>(),
                    IsStopped = false
                });

            // Act
            var result = await Orchestrator.StopIfCompleteBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.False(result.IsStopped);
            Assert.True(result.Messages.ContainsKey(MessageCode.StatusDescription));
            Assert.Contains("not stopped", result.Messages[MessageCode.StatusDescription].ToString());
        }

        [Fact]
        public async Task StopIfCompleteBenchTest_WithZeroBoardId_ReturnsError()
        {
            // Arrange
            var request = new StopIfCompleteBenchTestRequest { BoardId = 0 };

            // Act
            var result = await Orchestrator.StopIfCompleteBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.Equal("InvalidRequest", result.Messages[MessageCode.ErrorCode]);
        }

        [Fact]
        public async Task StopIfCompleteBenchTest_WithNegativeBoardId_ReturnsError()
        {
            // Arrange
            var request = new StopIfCompleteBenchTestRequest { BoardId = -10 };

            // Act
            var result = await Orchestrator.StopIfCompleteBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorCode));
            Assert.True(result.Messages.ContainsKey(MessageCode.ErrorDetails));
        }

        #endregion

        #region Edge Case Tests

        [Fact]
        public async Task AddBenchTest_WithEmptyDeviceList_ReturnsSuccess()
        {
            // Arrange
            var request = new AddBenchTestRequest
            {
                BenchTest = new BenchTest
                {
                    BoardID = 1,
                    UserID = "TestUser",
                    ForceUpdate = true,
                    BenchTestItemList = Array.Empty<BenchTestItemList>()
                }
            };

            // Mock the service response
            Services.BenchTest.Setup(s => s.AddBenchTest(It.IsAny<WcfTestService.BenchTest>()))
                .ReturnsAsync(new WcfTestService.AddBenchTestResponse
                {
                    ResponseStatus = WcfTestService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfTestService.ResponseError>()
                });

            // Act
            var result = await Orchestrator.AddBenchTest(request);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Messages.ContainsKey(MessageCode.StatusDescription));
        }

        [Fact]
        public async Task AddBenchTestBoard_WithAllProperties_PreservesData()
        {
            // Arrange
            var board = new BenchTestBoard
            {
                BoardID = 123,
                Name = "Detailed Board",
                LocationCode = 5,
                StatusCode = 2,
                UserID = "admin@test.com",
                StartDateTime = DateTime.Now,
                EndDateTime = DateTime.Now.AddDays(1)
            };
            var request = new AddBenchTestBoardRequest { Board = board };

            // Mock the service response
            Services.BenchTestBoard.Setup(s => s.AddBenchTestBoard(It.IsAny<WcfBoardService.BenchTestBoard>()))
                .ReturnsAsync(new WcfBoardService.AddBenchTestBoardResponse
                {
                    ResponseStatus = WcfBoardService.ResponseStatus.Success,
                    ResponseErrors = Array.Empty<WcfBoardService.ResponseError>()
                });

            // Act
            var result = await Orchestrator.AddBenchTestBoard(request);

            // Assert
            Assert.NotNull(result.Board);
            Assert.Equal(board.BoardID, result.Board.BoardID);
            Assert.Equal(board.Name, result.Board.Name);
            Assert.Equal(board.LocationCode, result.Board.LocationCode);
            Assert.Equal(board.StatusCode, result.Board.StatusCode);
            Assert.Equal(board.UserID, result.Board.UserID);
        }

        #endregion
    }
}

