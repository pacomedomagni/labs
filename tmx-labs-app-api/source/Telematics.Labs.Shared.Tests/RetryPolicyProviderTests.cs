using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using Progressive.Telematics.Labs.Shared.RetryPolicyProviders;
using Progressive.Telematics.Labs.Shared.Configs;
using System.Net.Http;
using System.Net;
using System.Threading.Tasks;
using Xunit;
using Telematics.Admin.Shared.Tests.Mocks;
using Moq;

namespace Telematics.Admin.Shared.Tests;

public class RetryPolicyProviderTests
{
    private const string httpClientName = "testName";
    private const string testURI = "http://www.iam-a-test.com/";
    private readonly IServiceCollection services;

    public RetryPolicyProviderTests()
    {
        ConfigurationBuilder configBuilder = new();

        Dictionary<string, string> configData = new() { { "RetryOptions:TransientHTTPErrorMaxRetryAttempts", "1" },
            { "RetryOptions:TransientHTTPErrorMedianFirstRetryDelayMs", "1000" } };

        IConfiguration configuration = configBuilder.AddInMemoryCollection(configData).Build();

        services = new ServiceCollection();

        services
            .Configure<HttpRetryConfig>(configuration.GetSection("RetryOptions"))
            .AddTransient<IRetryPolicyProvider, RetryPolicyProvider>();
    }

    [Theory]
    [InlineData(HttpStatusCode.InternalServerError)]
    [InlineData(HttpStatusCode.TooManyRequests)]
    [InlineData(HttpStatusCode.RequestTimeout)]
    public async Task RetryableHttpResponseBehaviorTest(HttpStatusCode retryableStatus)
    {
        HttpMessageHandlerMoq httpMessageHandler = new();

        httpMessageHandler.SetupRetryableSendAsync(
            new()
            {
                Method = HttpMethod.Get,
                RequestUri = new(testURI)
            },
            (seq) =>
            {
                seq.ReturnsAsync(new HttpResponseMessage(retryableStatus));
                seq.ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK));
            });

        services
            .AddHttpClient(httpClientName)
            .AddPolicyHandler((sp, hrm) =>
            {
                var policyProvider = sp.GetRequiredService<IRetryPolicyProvider>();
                return policyProvider.HttpRetryPolicy;
            })
            .ConfigurePrimaryHttpMessageHandler(() => httpMessageHandler.Object);

        HttpClient configuredClient =
            services
                .BuildServiceProvider()
                .GetRequiredService<IHttpClientFactory>()
                .CreateClient(httpClientName);

        var result = await configuredClient.GetAsync(testURI);

        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        httpMessageHandler.Invoked(2);
    }
}

