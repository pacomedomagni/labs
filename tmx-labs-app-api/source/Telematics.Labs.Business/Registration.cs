using System;
using System.Linq;
using System.Reflection;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using FulfillmentWeb.Shared;
using FulfillmentWeb.Shared.CodeTableManager;

namespace Progressive.Telematics.Labs.Business;

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

        // Scan Progressive.Telematics.Labs.Business namespace
        services.AddServicesWithAttributeOfType<SingletonServiceAttribute>(typeof(IServiceCollectionExtension).Namespace);
        
        // Manually register the FulfillmentWeb code table services
        // These are in a different namespace (FulfillmentWeb.Shared) within the Telematics.Labs.Shared assembly
        services.AddSingleton<IFulfillmentWebCodeTableManager, FulfillmentWebCodeTableManager>();
        services.AddSingleton<FulfillmentWebCodeTableProvider>();

        return services;
    }
}

