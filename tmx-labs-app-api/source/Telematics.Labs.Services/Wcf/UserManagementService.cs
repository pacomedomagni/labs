using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using System.Collections.Generic;
using System.Threading.Tasks;
using Progressive.WAM.Webguard.Protect.Core.General20;
using WcfUserManagementService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IUserManagementService
    {
        Task<string> GetUserFullName();
        Task<GetUserByUIDResponse> GetUserByUID(string searhString);
        Task<GetUserByUserNameResponse> GetUserByUserName(string userName);
        Task<List<Business.Resources.Resources.Customer.LabsUser>> GetCustomersBySearchString(string searchString);
        Task<CreateUserResponse> CreateUser(CreateUserRequest request);
        Task UpdateUser(UpdateUserRequest request);
        Task UpdateUserPartial(UpdateUserRequest request);

    }

    public class UserManagementService : WcfService<EntityServiceClient>, IUserManagementService
    {
        private readonly IHttpContextAccessor contextAccessor;

        public UserManagementService(ILogger<UserManagementService> logger, IWcfServiceFactory factory, IHttpContextAccessor contextAccessor)
            : base(logger, factory.CreateUserManagementServiceClient)
        {
            this.contextAccessor = contextAccessor;
        }

        public async Task<string> GetUserFullName()
        {
            var fullName = contextAccessor.HttpContext.Request.Headers[HttpContextExtensions.TMX_USER_HEADER].ToString();
            if (!string.IsNullOrWhiteSpace(fullName))
                return fullName;

            using var client = CreateClient();
            var response = await client.GetUserByUserNameAsync(new GetUserByUserNameRequest
            {
                Username = contextAccessor.CurrentUser()
            });

            return response.User != null ? response.User.FullName : contextAccessor.CurrentUser();
        }

        public async Task<GetUserByUserNameResponse> GetUserByUserName(string userName)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetUserByUserNameAsync(new GetUserByUserNameRequest
            {
                Username = userName,
            }), logger);
            return response;
        }


        public async Task<List<Business.Resources.Resources.Customer.LabsUser>> GetCustomersBySearchString(string searchString)
        {
            using var client = CreateClient();
            var matchingUsers = new List<Business.Resources.Resources.Customer.LabsUser>();
            var usersByUserName = await GetUserByUserName(searchString);
            if (usersByUserName.ResponseStatus.Equals(WcfUserManagementService.ResponseStatus.Success))
            {
                if (usersByUserName.User != null)
                {
                    matchingUsers.Add(MapUserData(usersByUserName.User));
                }
            }

            var usersByLastName = await client.HandledCall(() => client.GetUsersByLastNameAsync(new GetUsersByLastNameRequest
            {
                UsernameToMatch = searchString,
                AccessType = AccessType.UbiPerson
            }), logger);

            if (usersByLastName.ResponseStatus.Equals(WcfUserManagementService.ResponseStatus.Success))
            {
                if (usersByLastName.UserList.Length > 0)
                {
                    foreach (var user in usersByLastName.UserList)
                    {
                        matchingUsers.Add(MapUserData(user));
                    }
                }
            }
            return matchingUsers;
        }

        public async Task<GetUserByUIDResponse> GetUserByUID(string searhString)
        {
            await using var client = CreateClient();
            var usersByFirstName = await client.HandledCall(() => client.GetUserByUIDAsync(new GetUserByUIDRequest
            {
                UID = searhString,
            }), logger);
            return usersByFirstName;
        }

        public async Task<CreateUserResponse> CreateUser(CreateUserRequest request)
        {
            await using var client = CreateClient();
            return await client.HandledCall(() => client.CreateUserAsync(request), logger);
        }

        public async Task UpdateUser(UpdateUserRequest request)
        {
            await using var client = CreateClient();
            await client.HandledCall(() => client.UpdateUserAsync(request), logger);
        }

        public async Task UpdateUserPartial(UpdateUserRequest request)
        {
            await using var client = CreateClient();
            await client.HandledCall(() => client.UpdateUserPartialAsync(request), logger);
        }

        private static Business.Resources.Resources.Customer.LabsUser MapUserData(WcfUserManagementService.User user)
        {
            if (user == null) return null;
            return new Business.Resources.Resources.Customer.LabsUser()
            {
                AccessType = (Business.Resources.Enums.AccessType)user.AccessType,
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
}

