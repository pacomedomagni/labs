using System;
using System.Linq;
using System.Reflection;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Net.Http.Headers;
using Microsoft.OpenApi.Models;
using Progressive.Telematics.Labs.Business.ResponseModels;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Progressive.Telematics.Labs.Api
{
	public static class SwaggerExtensions
	{
		public static void AddIGuardAndJwtSupport(this SwaggerGenOptions options)
		{
			options.UseOneOfForPolymorphism();
			options.SchemaFilter<ApiResponseTypeSchemaFilter>();
			options.CustomSchemaIds(x => x.FriendlyId());

			// JWT auth
			options.AddSecurityDefinition(
				"token",
				new OpenApiSecurityScheme
				{
					Type = SecuritySchemeType.Http,
					BearerFormat = "JWT",
					Scheme = "Bearer",
					In = ParameterLocation.Header,
					Name = HeaderNames.Authorization
				}
			);

			options.AddSecurityRequirement(
				new OpenApiSecurityRequirement
				{
					{
						new OpenApiSecurityScheme
						{
							Reference = new OpenApiReference
							{
								Type = ReferenceType.SecurityScheme,
								Id = "token"
							},
						},
						Array.Empty<string>()
					}
				}
			);

		}
	}

	public class ApiResponseTypeSchemaFilter : ISchemaFilter
	{
		public void Apply(OpenApiSchema schema, SchemaFilterContext context)
		{
			var type = context.Type;

			if (!type.IsAbstract && type.GetInterfaces().Contains(typeof(IApiFailureResponse)))
			{
				var code = type.GetProperty("ErrorCode").GetValue(Activator.CreateInstance(type), null).ToString();
				var message = type.GetProperty("DeveloperMessage").GetValue(Activator.CreateInstance(type), null).ToString();

				if(schema.Properties.ContainsKey("errorCode"))
					schema.Properties["errorCode"].Description = code;
				if (schema.Properties.ContainsKey("developerMessage"))
					schema.Properties["developerMessage"].Description = message;
			}
		}
	}

	internal static class TypeExtensions
	{
		internal static int counter = 0;

		internal static string FriendlyId(this Type type)
		{
			var typeName = type.FullNameSansTypeArguments().Replace("+", ".");

			if (type.GetTypeInfo().IsGenericType)
			{
				var genericArgumentIds = type.GetGenericArguments()
					.Select(t => t.FriendlyId())
					.ToArray();

				return new StringBuilder(typeName)
					.Replace(string.Format("`{0}", genericArgumentIds.Count()), string.Empty)
					.Append(string.Format("[{0}]", string.Join(",", genericArgumentIds).TrimEnd(',')))
					.ToString();
			}

			if (string.IsNullOrWhiteSpace(typeName))
			{
				typeName += counter.ToString();
				counter++;
			}

			return typeName;
		}

		private static string FullNameSansTypeArguments(this Type type)
		{
			if (string.IsNullOrEmpty(type.FullName)) return string.Empty;

			var fullName = type.FullName;
			var chopIndex = fullName.IndexOf("[[");
			return (chopIndex == -1) ? fullName : fullName.Substring(0, chopIndex);
		}
	}
}

