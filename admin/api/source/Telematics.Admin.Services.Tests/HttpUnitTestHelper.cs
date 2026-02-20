using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Moq.Protected;

namespace Telematics.Admin.Services.Tests
{
    internal static class HttpUnitTestHelper
    {
        internal static Mock<HttpMessageHandler> SetupMockHttpHandler(HttpStatusCode responseStatus)
        {
            var response = new HttpResponseMessage { StatusCode = responseStatus };
            return SetupMockHttpHandler(response);
        }

        internal static Mock<HttpMessageHandler> SetupMockHttpHandler<T>(HttpStatusCode responseStatus, T responseContent = null) where T : class
        {
            var content = new StringContent(JsonSerializer.Serialize(responseContent ?? Activator.CreateInstance(typeof(T))), Encoding.UTF8, "application/json");
            var response = new HttpResponseMessage { StatusCode = responseStatus, Content = content };
            return SetupMockHttpHandler(response);
        }

        internal static Mock<HttpMessageHandler> SetupMockHttpHandler(HttpResponseMessage response)
        {
            var handlerMock = new Mock<HttpMessageHandler>();

            handlerMock
               .Protected()
               .Setup<Task<HttpResponseMessage>>(
                  "SendAsync",
                  ItExpr.IsAny<HttpRequestMessage>(),
                  ItExpr.IsAny<CancellationToken>())
               .ReturnsAsync(response);

            return handlerMock;
        }
    }
}
