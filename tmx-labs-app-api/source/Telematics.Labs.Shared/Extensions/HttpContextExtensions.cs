using Microsoft.AspNetCore.Http;

namespace Progressive.Telematics.Labs.Shared
{
    public static class HttpContextExtensions
    {
        public const string TMX_USER_HEADER = "x-tmxtrace-tmxuser";

        public static string CurrentUser(this IHttpContextAccessor httpContext)
        {
            var fullName = httpContext.HttpContext.Request.Headers[TMX_USER_HEADER].ToString();
            return !string.IsNullOrWhiteSpace(fullName) ? fullName : httpContext.HttpContext.User.Identity.Name;
        }
    }
}

