using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using WcfUserManagementService;

namespace Progressive.Telematics.Admin.Services.Wcf
{
    [SingletonService]
    public interface IUserManagementService
    {
        Task<string> GetUserFullName();
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
    }
}
