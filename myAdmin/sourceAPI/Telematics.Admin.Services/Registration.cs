using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Castle.Core.Configuration;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Admin.Business;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Database.CommercialLines;
using Progressive.Telematics.Admin.Services.Database.Handlers;
using Progressive.Telematics.Admin.Services.Models.ClTables;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Shared.Configs;
using TheFloowApi;

namespace Progressive.Telematics.Admin.Services
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

            services
              .AddTransient<IClaimsParticipantManagementApi, ClaimsParticipantManagementApi>()
              .AddTransient<ICommonApi, CommonApi>()
              .AddTransient<IDeviceApi, DeviceApi>()
              .AddTransient<IHomebaseParticipantManagementApi, HomebaseParticipantManagementApi>()
              .AddTransient<IPolicyApi, PolicyApi>()
              .AddTransient<IPolicyDeviceApi, PolicyDeviceApi>()
              .AddTransient<ITheFloowApiClient, TheFloowApiClient>()
              .AddTransient<IPolicyTripApi, PolicyTripApi>()
              .AddTransient<IUbiApi, UbiApi>()
              .AddTransient<ITrialApi, TrialApi>()
              .AddTransient<IPolicyServicingApi, PolicyServicingApi>()
              .AddTransient<ITmxPolicyApi, TmxPolicyApi>()
              .AddTransient<IClaimsRegistrationApi, ClaimsRegistrationApi>();

            services.AddSingleton<ICommercialLineCommands, CommercialLineCommands>();
            services.AddSingleton<IRemoveOptOutService, RemoveOptOutService>();

            services.AddDbContext<CLContext>(
                (serviceProvider, dbContextBuilder) =>
                {
                    var connectionStringPlaceHolder = configuration.GetConnectionString(
                        "Commercial"
                    );
                    var environment = configuration.GetSection("EnvironmentPrefixes:SQL").Value;

                    var connectionString = connectionStringPlaceHolder.InsertEnvironmentType(
                        environment
                    );
                    dbContextBuilder.UseSqlServer(connectionString);
                }
            );

            return services;
        }
    }
}
