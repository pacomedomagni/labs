using System;
using System.Linq;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business
{
    public static class IServiceCollectionExtension
    {
        public static IServiceCollection AddTelematicsBusinessLayer(this IServiceCollection services)
        {
            services.AddAutoMapper(
                AppDomain.CurrentDomain.GetAssemblies()
                .First(x => x.FullName.StartsWith(typeof(IServiceCollectionExtension).Namespace))
                .GetTypes()
                .Where(x => x.BaseType != null && x.BaseType.Equals(typeof(Profile))).ToArray()
            );

            services.AddServicesWithAttributeOfType<SingletonServiceAttribute>(typeof(IServiceCollectionExtension).Namespace);
            services.AddServicesWithAttributeOfType<ScopedServiceAttribute>(typeof(IServiceCollectionExtension).Namespace);

            return services;
        }
    }
}
