using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using Progressive.Telematics.Labs.Business.Orchestrators.UserManagement;
using Progressive.Telematics.Labs.Business.Resources.Resources.Customer;
using Progressive.Telematics.Labs.Business.Resources.Resources.UserManagement;
using Progressive.Telematics.Labs.Services.Wcf;
using Xunit;

namespace Progressive.Telematics.Labs.Business.Tests.Orchestrators.UserManagement;

public class LabsUserManagementOrchestratorTests
{
    private readonly Mock<IUserManagementService> _userManagementServiceMock = new();
    private readonly Mock<IParticipantGroupService> _participantGroupServiceMock = new();

    private LabsUserManagementOrchestrator CreateOrchestrator() =>
        new LabsUserManagementOrchestrator(_userManagementServiceMock.Object, _participantGroupServiceMock.Object);

    [Fact]
    public async Task ValidateNewCustomer_ReturnsNotCustomer_WhenUserNotFound()
    {
        // Arrange
        var email = "test@example.com";
        _userManagementServiceMock
            .Setup(s => s.GetCustomersBySearchString(email))
            .ReturnsAsync(new List<LabsUser>());

        var orchestrator = CreateOrchestrator();

        // Act
        var result = await orchestrator.ValidateNewCustomer(new ValidateNewCustomerBody { EmailAddress = email });

        // Assert
        Assert.False(result.IsCustomer);
        Assert.True(result.IsAbleToEnroll);
    }

    [Fact]
    public async Task ValidateNewCustomer_ReturnsNotCustomer_WhenParticipantGroupIsNull()
    {
        // Arrange
        var email = "test@example.com";
        var user = new LabsUser { UID = "uid123", LastName = "Smith", Address = "123 Main", City = "Cleveland", FirstName = "John", PhoneNumber = "555-1234", State = "OH", Zip = "44114" };
        _userManagementServiceMock
            .Setup(s => s.GetCustomersBySearchString(email))
            .ReturnsAsync(new List<LabsUser> { user });

        _participantGroupServiceMock
            .Setup(s => s.GetPartGroupByExtKey(user.UID))
            .ReturnsAsync(new ParticipantGroupService.GetPartGroupByExtKeyResponse
            {
                ResponseStatus = ParticipantGroupService.ResponseStatus.Success,
                ParticipantGroup = null
            });

        var orchestrator = CreateOrchestrator();

        // Act
        var result = await orchestrator.ValidateNewCustomer(new ValidateNewCustomerBody { EmailAddress = email });

        // Assert
        Assert.False(result.IsCustomer);
        Assert.True(result.IsAbleToEnroll);
        Assert.Equal("Smith", result.LastName);
        Assert.Equal("123 Main", result.Address);
        Assert.Equal("Cleveland", result.City);
        Assert.Equal("John", result.FirstName);
        Assert.Equal("555-1234", result.PhoneNumber);
        Assert.Equal("OH", result.State);
        Assert.Equal("44114", result.Zip);
    }

    [Fact]
    public async Task ValidateNewCustomer_ReturnsCustomer_WhenParticipantGroupExists()
    {
        // Arrange
        var email = "test@example.com";
        var user = new LabsUser { UID = "uid123" };
        _userManagementServiceMock
            .Setup(s => s.GetCustomersBySearchString(email))
            .ReturnsAsync(new List<LabsUser> { user });

        _participantGroupServiceMock
            .Setup(s => s.GetPartGroupByExtKey(user.UID))
            .ReturnsAsync(new ParticipantGroupService.GetPartGroupByExtKeyResponse
            {
                ResponseStatus = ParticipantGroupService.ResponseStatus.Success,
                ParticipantGroup = new ParticipantGroupService.ParticipantGroup { ParticipantGroupSeqID = 42 }
            });

        var orchestrator = CreateOrchestrator();

        // Act
        var result = await orchestrator.ValidateNewCustomer(new ValidateNewCustomerBody { EmailAddress = email });

        // Assert
        Assert.True(result.IsCustomer);
        Assert.False(result.IsAbleToEnroll);
        Assert.Equal(42, result.ParticipantGroupSeqID);
    }
}
