using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using Azure.Core;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Customer;
using Progressive.Telematics.Labs.Business.Resources.Resources.UserManagement;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfUserManagementService;
using ResponseStatus = WcfUserManagementService.ResponseStatus;

namespace Progressive.Telematics.Labs.Business.Orchestrators.UserManagement;

[SingletonService]
public interface IAddNewAccountOrchestrator
{
    Task<AddAccountResponse> AddNewAccount(AddAccountRequest request);
}
public class AddNewAccountOrchestrator : IAddNewAccountOrchestrator
{
    private readonly ILogger<AddNewAccountOrchestrator> _logger;
    private readonly IUserManagementService _userManagementService;
    private readonly IParticipantGroupDAL _participantGroupDAL;
    private readonly IParticipantDAL _participantDAL;

    public AddNewAccountOrchestrator(ILogger<AddNewAccountOrchestrator> logger, IUserManagementService userManagementService, IParticipantGroupDAL participantGroupDAL, IParticipantDAL participantDAL)
    {
        _logger = logger;
        _userManagementService = userManagementService;
        _participantGroupDAL = participantGroupDAL;
        _participantDAL = participantDAL;
    }
    public async Task<AddAccountResponse> AddNewAccount(AddAccountRequest newCustomer)
    {
        var response = new AddAccountResponse();
        string participantGroupExternalKey = null;

        // If no email/username provided, we won't create account in the LDAP. Track with GUID
        if (string.IsNullOrEmpty(newCustomer.UserName))
        {
            participantGroupExternalKey = Guid.NewGuid().ToString();
        }
        else
        {
            var userResponse = await _userManagementService.GetUserByUserName(newCustomer.UserName);
            if (HandleError(response, userResponse, "RetrieveUserFailed", "Failed to retrieve user."))
            {
                return response;
            }

            // Existing LDAP User
            if (userResponse.User != null)
            {
                participantGroupExternalKey = userResponse.User.UID;
                var updatedLdapUser = CopyNewUserToLdapUser(userResponse.User, newCustomer, false);

                var updateUserRequest = new UpdateUserRequest();
                updateUserRequest.User = updatedLdapUser;
                await _userManagementService.UpdateUser(updateUserRequest);
            }
            // New User
            else
            {
                var createUserRequest = new CreateUserRequest();

                var newLdapUser = new User();
                createUserRequest.User = CopyNewUserToLdapUser(newLdapUser, newCustomer, true);

                var createUserResponse = await _userManagementService.CreateUser(createUserRequest);

                if (HandleError(response, createUserResponse, "CreateUserFailed", "Failed to create user."))
                {
                    return response;
                }

                participantGroupExternalKey = createUserResponse.UID;
            }
        }
        await AddParticipants(participantGroupExternalKey, newCustomer, response);
        response.ParticipantGroupExternalKey = participantGroupExternalKey;
        return response;
    }

    /// <summary>
    /// Handle WCF errors
    /// </summary>
    /// <param name="response"></param>
    /// <param name="wcfResponse"></param>
    /// <param name="errorCode"></param>
    /// <param name="errorMessage"></param>
    /// <returns>True if fatal error. False if no errors.</returns>
    /// <exception cref="Exception"></exception>
    private bool HandleError(Resource response, WcfUserManagementService.UBIServiceResponse wcfResponse, string errorCode, string errorMessage)
    {
        // TODO: Rework when we nail down global error handling strategy
        if (wcfResponse.ResponseStatus == ResponseStatus.Failure || wcfResponse.ResponseStatus == ResponseStatus.FailureWithWarning)
        {
            _logger.LogError(LoggingEvents.AddNewAccountOrchestrator_AddNewAccountError,
                "{errorMessage} {wcfError}", errorMessage, wcfResponse.ResponseErrors);

            response.AddMessage(MessageCode.Error, errorMessage);
            response.AddMessage(MessageCode.ErrorCode, errorCode);
            foreach (var err in wcfResponse.ResponseErrors)
            {
                response.AddMessage(MessageCode.ErrorDetails, err);
            }
            return true;
        }

        return false;
    }

    private async Task AddParticipants(string participantGroupExternalKey, AddAccountRequest newCustomer, AddAccountResponse response)
    {
        using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

        response.ParticipantGroupSeqID = await _participantGroupDAL.AddParticipantGroup(new ParticipantGroupDataModel()
        {
            ParticipantGroupExternalKey = participantGroupExternalKey,
            ParticipantGroupType = Constants.ParticipantGroupTypes.COF
        });

        foreach (var vehicleDriver in newCustomer.DriversVehicles)
        {
            int deviceOrderSeqId = await _participantDAL.AddParticipant(new AddAccountParticipantRequest()
            {
                ParticipantGroupSeqId = response.ParticipantGroupSeqID,
                DriverVehicleInformation = new VehicleInformation()
                {
                    ScoringAlgorithmCode = vehicleDriver.ScoringAlgorithmCode,
                    Vehicle = vehicleDriver.Vehicle
                }
            });
            response.DeviceOrderSeqIDs.Add(deviceOrderSeqId);
        }

        scope.Complete();
    }

    /// <summary>
    /// Copy over the new user info to the ldap user object
    /// </summary>
    /// <param name="ldapUser">Existing ldap user</param>
    /// <param name="updatedUser">Requested user changes</param>
    /// <param name="newUser">Updated ldap user</param>
    /// <returns></returns>
    private User CopyNewUserToLdapUser(User ldapUser, AddAccountRequest updatedUser, bool newUser)
    {
        // Helper for null/empty fallback
        static string ValueOrDefault(string value, string fallback) =>
            !string.IsNullOrWhiteSpace(value) ? value : fallback;

        if (newUser)
        {
            ldapUser.Email = updatedUser.UserName;
            ldapUser.UserName = updatedUser.UserName;
            ldapUser.Password = ValueOrDefault(updatedUser.Password, Constants.LdapUserDefaults.Password);
            ldapUser.PasswordQuestion = ValueOrDefault(updatedUser.PasswordQuestion, Constants.LdapUserDefaults.PasswordQuestion);
            ldapUser.PasswordAnswer = ValueOrDefault(updatedUser.PasswordAnswer, Constants.LdapUserDefaults.PasswordAnswer);
            ldapUser.Roles = new[] { Constants.Roles.MyScoreRole };
        }
        else
        {
            // Ensure MyScoreRole is present
            var roles = (ldapUser.Roles ?? Array.Empty<string>()).ToList();
            if (!roles.Contains(Constants.Roles.MyScoreRole))
                roles.Add(Constants.Roles.MyScoreRole);
            ldapUser.Roles = roles.ToArray();
        }

        ldapUser.LastName = updatedUser.LastName;
        ldapUser.Address = ValueOrDefault(updatedUser.Address, Constants.LdapUserDefaults.Address);
        ldapUser.City = ValueOrDefault(updatedUser.City, Constants.LdapUserDefaults.City);
        ldapUser.Company = ValueOrDefault(updatedUser.Company, Constants.LdapUserDefaults.Company);
        ldapUser.FirstName = ValueOrDefault(updatedUser.FirstName, Constants.LdapUserDefaults.FirstName);
        ldapUser.FullName = ValueOrDefault(updatedUser.FullName, Constants.LdapUserDefaults.FullName);
        ldapUser.PhoneNumber = ValueOrDefault(updatedUser.PhoneNumber, Constants.LdapUserDefaults.PhoneNumber);
        ldapUser.State = ValueOrDefault(updatedUser.State, Constants.LdapUserDefaults.State);
        ldapUser.Zip = ValueOrDefault(updatedUser.Zip, Constants.LdapUserDefaults.Zip);

        return ldapUser;
    }

}
