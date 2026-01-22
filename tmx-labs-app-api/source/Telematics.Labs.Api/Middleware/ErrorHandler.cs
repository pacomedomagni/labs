using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Api.Middleware
{
    public class ErrorHandler
    {
        private readonly RequestDelegate next;
        private readonly ILogger<ErrorHandler> logger;

        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        public ErrorHandler(RequestDelegate next, ILogger<ErrorHandler> logger)
        {
            this.next = next;
            this.logger = logger;
        }

        public async Task Invoke(HttpContext context, IWebHostEnvironment env)
        {
            var originalBodyStream = context.Response.Body;
            using var memoryStream = new MemoryStream();
            context.Response.Body = memoryStream;

            try
            {
                await next(context);

                memoryStream.Seek(0, SeekOrigin.Begin);
                var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();

                // Parse the response body as JSON and check for error
                if (!string.IsNullOrWhiteSpace(responseBody))
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(responseBody);
                        if (doc.RootElement.ValueKind == JsonValueKind.Object && 
                            doc.RootElement.TryGetProperty("messages", out var messages) && 
                            messages.ValueKind == JsonValueKind.Object)
                        {
                            if (messages.TryGetProperty("Error", out var errorProp) &&
                                !string.IsNullOrWhiteSpace(errorProp.GetString()))
                            {
                                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                            }
                        }
                    }
                    catch (JsonException)
                    {
                        // Ignore parse errors, treat as non-error response
                    }
                }

                memoryStream.Seek(0, SeekOrigin.Begin);
                await memoryStream.CopyToAsync(originalBodyStream);
            }
            catch (Exception ex)
            {
                // Restore the original stream before writing the error response
                context.Response.Body = originalBodyStream;
                await HandleExceptionAsync(context, ex, env, logger);
                return; // Prevent finally from resetting the stream again
            }
            finally
            {
                context.Response.Body = originalBodyStream;
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

            var errCd = 666;
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

            var result = JsonSerializer.Serialize(resource, JsonOptions);
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
    }
}

