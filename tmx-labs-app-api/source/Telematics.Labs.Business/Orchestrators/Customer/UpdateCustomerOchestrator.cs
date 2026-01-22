using System;
using System.Threading.Tasks;
using System.Transactions;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Customer;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfUserManagementService;
using AccessType = Progressive.Telematics.Labs.Business.Resources.Enums.AccessType;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Customer;

[SingletonService]
public interface IUpdateCustomerOrchestrator
{
    Task<UpdateCustomerResponse> UpdateCustomer(UpdateCustomerRequest request);
}

public class UpdateCustomerOchestrator : IUpdateCustomerOrchestrator
{
    private const string PARTICIPANT_GROUP_NOT_FOUND = "ParticipantGroup not found for ID: {0}";
    private const string PARTICIPANT_GROUP_UPDATE_FAILED = "Failed to update ParticipantGroup for ID: {0}";
    private const string USER_UPDATE_FAILED = "Failed to update user information for ID: {0}";
    private const string REFRESH_FAILED = "Changes were saved but failed to refresh customer details";

    private readonly ICustomerInfoDAL _customerDAL;
    private readonly IUserManagementService _userManagementService;
    private readonly ILogger<UpdateCustomerOchestrator> _logger;

    public UpdateCustomerOchestrator(ICustomerInfoDAL customerDAL, IUserManagementService userManagementService, ILogger<UpdateCustomerOchestrator> logger)
    {
        _customerDAL = customerDAL;
        _userManagementService = userManagementService;
        _logger = logger;
    }

    public async Task<UpdateCustomerResponse> UpdateCustomer(UpdateCustomerRequest request)
    {
        try
        {
            using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            var participantGroup = await GetAndValidateParticipantGroup(request);
            await UpdateParticipantGroupIfNeeded(request, participantGroup);
            await UpdateUserInformation(request, participantGroup);

            scope.Complete();

            var response = new UpdateCustomerResponse();
            var updatedCustomer = await RefreshCustomerDetails(participantGroup);
            if (updatedCustomer != null)
            {
                response.Customer = updatedCustomer;
                response.AddMessage(MessageCode.StatusDescription, "Customer updated successfully");
            }
            else
            {
                response.AddMessage(MessageCode.StatusDescription, REFRESH_FAILED);
                response.AddMessage(MessageCode.Handled, true);
            }

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(LoggingEvents.UpdateCustomerOrchestrator_Update_Error, ex,
                "Failed updating user information for ParticipantGroupSeqID: {ParticipantGroupSeqID}",
                request.Customer.ParticipantGroup.ParticipantGroupSeqID);
            throw;
        }
    }

    private async Task<Resources.Resources.Participant.ParticipantGroup> GetAndValidateParticipantGroup(UpdateCustomerRequest request)
    {
        var participantGroup = await _customerDAL.GetParticipantGroup(request.Customer.ParticipantGroup.ParticipantGroupSeqID);
        if (participantGroup == null)
        {
            throw new InvalidOperationException(string.Format(PARTICIPANT_GROUP_NOT_FOUND, 
                request.Customer.ParticipantGroup.ParticipantGroupSeqID));
        }
        return participantGroup;
    }

    private async Task UpdateParticipantGroupIfNeeded(UpdateCustomerRequest request, 
        Resources.Resources.Participant.ParticipantGroup participantGroup)
    {
        var reqPartGroupType = request.Customer.ParticipantGroup.ParticipantGroupTypeCode;
        if (reqPartGroupType > 0 && reqPartGroupType != participantGroup.ParticipantGroupTypeCode)
        {
            participantGroup.ParticipantGroupTypeCode = reqPartGroupType;
            try
            {
                await _customerDAL.UpdateParticipantGroup(participantGroup);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    string.Format(PARTICIPANT_GROUP_UPDATE_FAILED, participantGroup.ParticipantGroupSeqID), ex);
            }
        }
    }

    private async Task UpdateUserInformation(UpdateCustomerRequest request, 
        Resources.Resources.Participant.ParticipantGroup participantGroup)
    {
        try
        {
            var user = request.Customer.User;
            user.UID = participantGroup.ParticipantGroupExternalKey;

            var userReq = new UpdateUserRequest { 
                User = MapToWcfUser(user)
            };
            
            await _userManagementService.UpdateUserPartial(userReq);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                string.Format(USER_UPDATE_FAILED, participantGroup.ParticipantGroupSeqID), ex);
        }
    }

    private async Task<CustomerInfo> RefreshCustomerDetails(Resources.Resources.Participant.ParticipantGroup participantGroup)
    {
        var userResult = await _userManagementService.GetUserByUID(participantGroup.ParticipantGroupExternalKey);
        if (!userResult.ResponseStatus.ToString().Equals("Success") || userResult.User == null)
        {
            _logger.LogWarning(LoggingEvents.UpdateCustomerOrchestrator_Update_Error, REFRESH_FAILED);
            return null;
        }

        return new CustomerInfo
        {
            ParticipantGroup = participantGroup,
            User = MapUserData(userResult.User)
        };
    }

    private static LabsUser MapUserData(WcfUserManagementService.User user)
    {
        if (user == null) return null;
        return new LabsUser
        {
            AccessType = (AccessType)user.AccessType,
            Address = user.Address,
            City = user.City,
            Company = user.Company,
            Email = user.Email,
            FirstName = user.FirstName,
            FullName = user.FullName,
            LastName = user.LastName,
            Password = user.Password,
            PasswordAnswer = user.PasswordAnswer,
            PasswordQuestion = user.PasswordQuestion,
            PasswordResetDate = user.PasswordResetDate,
            PhoneNumber = user.PhoneNumber,
            Roles = user.Roles,
            State = user.State,
            UID = user.UID,
            UserName = user.UserName,
            Zip = user.Zip
        };
    }

    private static WcfUserManagementService.User MapToWcfUser(LabsUser user)
    {
        if (user == null) return null;
        return new WcfUserManagementService.User
        {
            AccessType = (WcfUserManagementService.AccessType)user.AccessType,
            Address = user.Address,
            City = user.City,
            Company = user.Company,
            Email = user.Email,
            FirstName = user.FirstName,
            FullName = user.FullName,
            LastName = user.LastName,
            Password = user.Password,
            PasswordAnswer = user.PasswordAnswer,
            PasswordQuestion = user.PasswordQuestion,
            PasswordResetDate = user.PasswordResetDate,
            PhoneNumber = user.PhoneNumber,
            Roles = user.Roles,
            State = user.State,
            UID = user.UID,
            UserName = user.UserName,
            Zip = user.Zip
        };
    }
}
