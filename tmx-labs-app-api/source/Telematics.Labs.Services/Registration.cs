using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Dapper;
using Microsoft.Extensions.DependencyInjection;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Services.Database.Handlers;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Services
{
    public static class IServiceCollectionExtension
    {
        public static IServiceCollection AddTelematicsServiceLayer(
            this IServiceCollection services,
            Microsoft.Extensions.Configuration.IConfiguration configuration
        )
        {
            services.AddServicesWithAttributeOfType<SingletonServiceAttribute>(
                typeof(IServiceCollectionExtension).Namespace
            );

            SqlMapper.AddTypeHandler(new GuidHandler());
            SqlMapper.AddTypeHandler(new NullableGuidHandler());
            SqlMapper.AddTypeHandler(new TrimmedStringHandler());
            SqlMapper.AddTypeHandler(new TimeSpanHandler());

            var dapperTypes = AppDomain.CurrentDomain
                .GetAssemblies()
                .First(x => x.FullName.StartsWith(typeof(Resource).Namespace))
                .GetTypes()
                .Where(x => x.BaseType != null && x.BaseType.Equals(typeof(Resource)));

            dapperTypes.ForEach(modelType =>
            {
                SqlMapper.SetTypeMap(
                    modelType,
                    new CustomPropertyTypeMap(
                        modelType,
                        (type, columnName) =>
                            type.GetProperties()
                                .FirstOrDefault(
                                    prop =>
                                        prop.GetCustomAttributes(false)
                                            .OfType<ColumnAttribute>()
                                            .Any(
                                                attr =>
                                                    attr.Name.Equals(
                                                        columnName,
                                                        StringComparison.OrdinalIgnoreCase
                                                    )
                                            )
                                        || prop.Name.Equals(
                                            columnName,
                                            StringComparison.OrdinalIgnoreCase
                                        )
                                )
                    )
                );
            });

            //services
              //.AddTransient<IClaimsParticipantManagementApi, ClaimsParticipantManagementApi>()
              //.AddTransient<ICommonApi, CommonApi>()
              //.AddTransient<IDeviceApi, DeviceApi>()
              //.AddTransient<IHomebaseParticipantManagementApi, HomebaseParticipantManagementApi>()
              //.AddTransient<IPolicyApi, PolicyApi>()
              //.AddTransient<IPolicyDeviceApi, PolicyDeviceApi>()
              //.AddTransient<ITheFloowApiClient, TheFloowApiClient>()
              //.AddTransient<IPolicyTripApi, PolicyTripApi>()
              //.AddTransient<IUbiApi, UbiApi>()
              //.AddTransient<ITrialApi, TrialApi>()
              //.AddTransient<IPolicyServicingApi, ApplicationConfigApi>()
              //.AddTransient<ITmxPolicyApi, TmxPolicyApi>(); 

            //services.AddSingleton<ICommercialLineCommands, CommercialLineCommands>();
            //services.AddSingleton<IRemoveOptOutService, RemoveOptOutService>();

            //services.AddDbContext<CLContext>(
            //    (serviceProvider, dbContextBuilder) =>
            //    {
            //        var connectionStringPlaceHolder = configuration.GetConnectionString(
            //            "Commercial"
            //        );
            //        var environment = configuration.GetSection("EnvironmentPrefixes:SQL").Value;

            //        var connectionString = connectionStringPlaceHolder.InsertEnvironmentType(
            //            environment
            //        );
            //        dbContextBuilder.UseSqlServer(connectionString);
            //    }
           // );

            return services;
        }
    }
}

