using Microsoft.Extensions.DependencyInjection;
using Progressive.WAM.Webguard.Client.Core;

namespace Progressive.Telematics.Labs.Shared.Utils
{
    public class WebguardAuthorizationClientHelper
    {
        private readonly IServiceCollection serviceCollection;

        public WebguardAuthorizationClientHelper(IServiceCollection collection)
        {
            serviceCollection = collection;
        }

        public WebguardAuthorizationClientHelper AddHttpClient<T, T1>() where T : class where T1 : class, T
        {
            serviceCollection.AddHttpClient<T, T1>().ConfigurePrimaryHttpMessageHandler<AuthorizationHandler>();
            return this;
        }
    }
}

