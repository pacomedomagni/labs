using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Labs.Business.Orchestrators.UserManagement;
using Progressive.Telematics.Labs.Business.Resources.Resources.UserManagement;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Wcf;
using WcfUserManagementService;
using Xunit;
using ResponseStatus = WcfUserManagementService.ResponseStatus;

namespace Progressive.Telematics.Labs.Business.Tests.Orchestrators.Account;

public class AddNewAccountOrchestratorTests
{
    private readonly Mock<ILogger<AddNewAccountOrchestrator>> _loggerMock = new();
    private readonly Mock<IUserManagementService> _userManagementServiceMock = new();
    private readonly Mock<IParticipantGroupDAL> _participantGroupDALMock = new();
    private readonly Mock<IParticipantDAL> _participantDALMock = new();

    private AddNewAccountOrchestrator CreateOrchestrator() =>
        new AddNewAccountOrchestrator(
            _loggerMock.Object,
            _userManagementServiceMock.Object,
            _participantGroupDALMock.Object,
            _participantDALMock.Object);

    [Fact]
    public async Task AddNewAccount_NoUserName_SetsGuidAndAddsParticipants()
    {
        // Arrange
        var request = new AddAccountRequest
        {
            UserName = null,
            DriversVehicles = new List<AddAccountDriverVehicleInformation>
        {
            new AddAccountDriverVehicleInformation
            {
                ScoringAlgorithmCode = 1,
                Vehicle = new AddVehicleModel()
            }
        }
        };
        _participantGroupDALMock.Setup(dal => dal.AddParticipantGroup(It.IsAny<ParticipantGroupDataModel>()))
            .ReturnsAsync(123);
        _participantDALMock.Setup(dal => dal.AddParticipant(It.IsAny<AddAccountParticipantRequest>()))
            .ReturnsAsync(456);

        var orchestrator = CreateOrchestrator();

        // Act
        var response = await orchestrator.AddNewAccount(request);

        // Assert
        Assert.False(string.IsNullOrEmpty(response.ParticipantGroupExternalKey));
        _participantGroupDALMock.Verify(dal => dal.AddParticipantGroup(It.IsAny<ParticipantGroupDataModel>()), Times.Once);
        _participantDALMock.Verify(dal => dal.AddParticipant(It.IsAny<AddAccountParticipantRequest>()), Times.Once);
    }

    [Fact]
    public async Task AddNewAccount_ExistingLdapUser_UpdatesUserAndAddsParticipants()
    {
        // Arrange
        var request = new AddAccountRequest
        {
            UserName = "existing@user.com",
            DriversVehicles = new List<AddAccountDriverVehicleInformation>
        {
            new AddAccountDriverVehicleInformation
            {
                ScoringAlgorithmCode = 1,
                Vehicle = new AddVehicleModel()
            }
        }
        };
        var user = new User { UID = "ldap-uid" };
        _userManagementServiceMock.Setup(s => s.GetUserByUserName(request.UserName))
            .ReturnsAsync(new GetUserByUserNameResponse
            {
                ResponseStatus = ResponseStatus.Success,
                User = user
            });
        _participantGroupDALMock.Setup(dal => dal.AddParticipantGroup(It.IsAny<ParticipantGroupDataModel>()))
            .ReturnsAsync(123);
        _participantDALMock.Setup(dal => dal.AddParticipant(It.IsAny<AddAccountParticipantRequest>()))
            .ReturnsAsync(456);

        var orchestrator = CreateOrchestrator();

        // Act
        var response = await orchestrator.AddNewAccount(request);

        // Assert
        Assert.Equal("ldap-uid", response.ParticipantGroupExternalKey);
        _userManagementServiceMock.Verify(s => s.UpdateUser(It.IsAny<UpdateUserRequest>()), Times.Once);
        _participantGroupDALMock.Verify(dal => dal.AddParticipantGroup(It.IsAny<ParticipantGroupDataModel>()), Times.Once);
        _participantDALMock.Verify(dal => dal.AddParticipant(It.IsAny<AddAccountParticipantRequest>()), Times.Once);
    }

    [Fact]
    public async Task AddNewAccount_NewLdapUser_CreatesUserAndAddsParticipants()
    {
        // Arrange
        var request = new AddAccountRequest
        {
            UserName = "new@user.com",
            DriversVehicles = new List<AddAccountDriverVehicleInformation>
        {
            new AddAccountDriverVehicleInformation
            {
                ScoringAlgorithmCode = 1,
                Vehicle = new AddVehicleModel()
            }
        }
        };
        _userManagementServiceMock.Setup(s => s.GetUserByUserName(request.UserName))
            .ReturnsAsync(new GetUserByUserNameResponse
            {
                ResponseStatus = ResponseStatus.Success,
                User = null
            });
        _userManagementServiceMock.Setup(s => s.CreateUser(It.IsAny<CreateUserRequest>()))
            .ReturnsAsync(new CreateUserResponse
            {
                ResponseStatus = ResponseStatus.Success,
                UID = "new-uid"
            });
        _participantGroupDALMock.Setup(dal => dal.AddParticipantGroup(It.IsAny<ParticipantGroupDataModel>()))
            .ReturnsAsync(123);
        _participantDALMock.Setup(dal => dal.AddParticipant(It.IsAny<AddAccountParticipantRequest>()))
            .ReturnsAsync(456);

        var orchestrator = CreateOrchestrator();

        // Act
        var response = await orchestrator.AddNewAccount(request);

        // Assert
        Assert.Equal("new-uid", response.ParticipantGroupExternalKey);
        _userManagementServiceMock.Verify(s => s.CreateUser(It.IsAny<CreateUserRequest>()), Times.Once);
        _participantGroupDALMock.Verify(dal => dal.AddParticipantGroup(It.IsAny<ParticipantGroupDataModel>()), Times.Once);
        _participantDALMock.Verify(dal => dal.AddParticipant(It.IsAny<AddAccountParticipantRequest>()), Times.Once);
    }

    [Fact]
    public async Task AddNewAccount_UserRetrievalFails_ReturnsErrorResponse()
    {
        // Arrange
        var request = new AddAccountRequest
        {
            UserName = "fail@user.com"
        };
        _userManagementServiceMock.Setup(s => s.GetUserByUserName(request.UserName))
            .ReturnsAsync(new GetUserByUserNameResponse
            {
                ResponseStatus = ResponseStatus.Failure,
                ResponseErrors = new[] { new WcfUserManagementService.ResponseError() { Message = "User not found" } }
            });

        var orchestrator = CreateOrchestrator();

        // Act
        var response = await orchestrator.AddNewAccount(request);

        // Assert
        Assert.Contains(response.Messages.Values, m => m.ToString().Contains("Failed to retrieve user."));
    }

    [Fact]
    public async Task AddNewAccount_CreateUserFails_ReturnsErrorResponse()
    {
        // Arrange
        var request = new AddAccountRequest
        {
            UserName = "failcreate@user.com"
        };
        _userManagementServiceMock.Setup(s => s.GetUserByUserName(request.UserName))
            .ReturnsAsync(new GetUserByUserNameResponse
            {
                ResponseStatus = ResponseStatus.Success,
                User = null
            });
        _userManagementServiceMock.Setup(s => s.CreateUser(It.IsAny<CreateUserRequest>()))
            .ReturnsAsync(new CreateUserResponse
            {
                ResponseStatus = ResponseStatus.Failure,
                ResponseErrors = new[] { new WcfUserManagementService.ResponseError() { Message = "Create failed" } }
            });

        var orchestrator = CreateOrchestrator();

        // Act
        var response = await orchestrator.AddNewAccount(request);

        // Assert
        Assert.Contains(response.Messages.Values, m => m.ToString().Contains("Failed to create user."));
    }
}
