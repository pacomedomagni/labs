using System;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Business;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Api.Middleware
{
    public class ErrorHandler
    {
        private readonly RequestDelegate next;
        private readonly ILogger<ErrorHandler> logger;

        public ErrorHandler(RequestDelegate next, ILogger<ErrorHandler> logger)
        {
            this.next = next;
            this.logger = logger;
        }

        public async Task Invoke(HttpContext context, IWebHostEnvironment env)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex, env, logger);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception, IWebHostEnvironment env, ILogger logger)
        {
            var baseException = exception.GetBaseException();
            var statusCode = HttpStatusCode.InternalServerError;
            var statusCodeDescription = HttpStatusCode.InternalServerError.ToString();
            var handled = false;

            var telematicsEx = baseException as TelematicsApiException;
            if (telematicsEx != null)
            {
                logger = telematicsEx.Logger;
                handled = true;
                if (telematicsEx.StatusCode != 0)
                {
                    statusCode = telematicsEx.StatusCode;
                    statusCodeDescription = telematicsEx.StatusCodeDescription;
                }
            }

            var errCd = GetErrorCode(baseException);
            var msg = ScrubMessage(baseException.Message);
            var msgDtl = telematicsEx != null ? telematicsEx.DeveloperMessage : baseException.Message;

            logger.LogError(new EventId(errCd), baseException, "Error: {Message} {MessageDetail}", msg, msgDtl != msg ? msgDtl : string.Empty);

            var resource = new Resource()
                .AddMessage(MessageCode.StatusCode, (int)statusCode)
                .AddMessage(MessageCode.StatusDescription, statusCodeDescription)
                .AddMessage(MessageCode.Handled, handled)
                .AddMessage(MessageCode.ErrorCode, errCd)
                .AddMessage(MessageCode.Error, msg);

            if (msg != msgDtl)
                resource.AddMessage(MessageCode.ErrorDetails, msgDtl);

            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                IgnoreNullValues = true
            };
            //options.Converters.Add(new DictionaryTKeyEnumTValueConverter());

            var result = JsonSerializer.Serialize(resource, options);
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;
            return context.Response.WriteAsync(result);
        }

        private static string ScrubMessage(string description)
        {
            if (description.Contains("{")) return description;

            var scrubbedMessage = description;
            scrubbedMessage = ScrubGuids(scrubbedMessage);
            scrubbedMessage = ScrubWordsWithNumbers(scrubbedMessage);
            return scrubbedMessage;
        }

        private static string ScrubWordsWithNumbers(string description)
        {
            return Regex.Replace(description, "(\\w*\\d+\\w*)", "X##");
        }

        private static string ScrubGuids(string message)
        {
            return Regex.Replace(message, "[({]?[a-fA-F0-9]{8}[-]?([a-fA-F0-9]{4}[-]?){3}[a-fA-F0-9]{12}[})]?", "{guid}");
        }

        private static int GetErrorCode(Exception ex)
        {
            Type @interface = null;
            Type @class = null;
            Type currType = null;
            int errCode = 666;

            try
            {
                var stackFrame = new StackTrace(ex, true).GetFrames().FirstOrDefault(x =>
                {
                    var method = x.GetMethod();
                    currType = method.DeclaringType;
                    @class = currType;
                    while (currType != null)
                    {
                        currType = currType.DeclaringType;
                        if (currType != null)
                            @class = currType;
                    }

                    @interface = @class.GetInterface($"I{@class.Name}");
                    if (@class.IsClass && @interface != null)
                    {
                        var methodName = method.IsPublic ? method.Name : method.ReflectedType.Name.Contains("<") ? Regex.Match(method.ReflectedType.Name, @"(?<=\<).+?(?=\>)").Value : method.ReflectedType.Name;
                        var iMethod = @interface.GetMethod(methodName);
                        var attr = iMethod.GetCustomAttribute<ErrorCodeAttribute>();
                        if (attr != null)
                        {
                            errCode = attr.ErrorCode;
                            return true;
                        }
                    }

                    return false;
                });

            }
            catch { }

            return errCode;
        }
    }
}
