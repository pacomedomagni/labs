using Moq;
using Moq.Language;
using Moq.Protected;
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Telematics.Admin.Shared.Tests.Mocks;

public class HttpMessageHandlerMoq : Mock<HttpMessageHandler>
{
    private HttpRequestMessage expectedRequestMessage;
    public void SetupRetryableSendAsync(
        HttpRequestMessage expectedRequestMessage,
        Action<ISetupSequentialResult<Task<HttpResponseMessage>>> sequenceOfResponsesDelegate)
    {
        this.expectedRequestMessage = expectedRequestMessage;

        var protectedMock = this.Protected();

        var setupSequence =
            protectedMock.SetupSequence<Task<HttpResponseMessage>>("SendAsync",
                                                                   ItExpr.Is<HttpRequestMessage>(actual => IsExpectedHttpMessage(actual)),
                                                                   ItExpr.IsAny<CancellationToken>());

        sequenceOfResponsesDelegate(setupSequence);
    }

    public void Invoked(int times)
    {
        var protectedMock = this.Protected();
        protectedMock.Verify("SendAsync",
                             Times.Exactly(times),
                             ItExpr.Is<HttpRequestMessage>(actual => IsExpectedHttpMessage(actual)),
                             ItExpr.IsAny<CancellationToken>());
    }

    private bool IsExpectedHttpMessage(HttpRequestMessage actualRequestMessage)
    {
        string expectedRequestUri = expectedRequestMessage.RequestUri.AbsoluteUri;

        var requestUriMatchesExpectations = string.Equals(expectedRequestUri, actualRequestMessage.RequestUri.AbsoluteUri, StringComparison.OrdinalIgnoreCase);

        var methodMatchesExpectations = actualRequestMessage.Method == expectedRequestMessage.Method;

        return requestUriMatchesExpectations && methodMatchesExpectations;
    }
}
