using System;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Admin.Shared.Configs;

namespace Progressive.Telematics.Admin.Shared.Utils
{
    public static class AppServicesHelper
    {
        private static IServiceProvider services = null;

        public static IServiceProvider Services
        {
            get { return services; }
            set
            {
                if (services != null)
                {
                    throw new Exception("Can't set once a value has already been set.");
                }
                services = value;
            }
        }

        public static T GetConfig<T>() where T : class
        {
            return (services.GetService(typeof(IOptions<T>)) as IOptions<T>).Value;
        }
    }
}
