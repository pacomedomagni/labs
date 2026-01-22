using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Contrib.WaitAndRetry;
using Polly.Extensions.Http;
using Polly.Retry;
using Progressive.Telematics.Labs.Shared.Configs;

namespace Progressive.Telematics.Labs.Shared.RetryPolicyProviders;

public interface IRetryPolicyProvider
{
    AsyncRetryPolicy<HttpResponseMessage> HttpRetryPolicy { get; }
}

public class RetryPolicyProvider : IRetryPolicyProvider
{
    public readonly int _retryCount;
    public readonly int _medianFirstRetryDelayMs;
    private readonly ILogger<RetryPolicyProvider> _logger;
    private readonly Lazy<AsyncRetryPolicy<HttpResponseMessage>> _asyncRetryPolicy;

    public RetryPolicyProvider(IOptions<HttpRetryConfig> config, ILogger<RetryPolicyProvider> logger)
    {
        ArgumentNullException.ThrowIfNull(logger);
        ArgumentNullException.ThrowIfNull(config?.Value?.TransientHTTPErrorMaxRetryAttempts);
        _logger = logger;
        _retryCount = config.Value.TransientHTTPErrorMaxRetryAttempts;
        _medianFirstRetryDelayMs = config.Value.TransientHTTPErrorMedianFirstRetryDelayMs;

        _asyncRetryPolicy = new Lazy<AsyncRetryPolicy<HttpResponseMessage>>(() => HttpResponseMessageRetryPolicy());
    }

    public AsyncRetryPolicy<HttpResponseMessage> HttpRetryPolicy => _asyncRetryPolicy.Value;

    public virtual AsyncRetryPolicy<HttpResponseMessage> HttpResponseMessageRetryPolicy()
    {
        var medianFirstRetryDelay = TimeSpan.FromMilliseconds(_medianFirstRetryDelayMs);

        IEnumerable<TimeSpan> retryDelays = Backoff.DecorrelatedJitterBackoffV2(
            medianFirstRetryDelay: medianFirstRetryDelay,
            retryCount: _retryCount,
            fastFirst: true);

        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .OrResult(RequiresRetry) //429 is not handled by HandleTransientHttpError()
            .WaitAndRetryAsync(retryDelays, OnRetryLogic);
    }

    private static bool RequiresRetry(HttpResponseMessage response)
    {
        return response.StatusCode == HttpStatusCode.TooManyRequests; //429 is not handled by HandleTransientHttpError()
    }

    protected async Task OnRetryLogic(
    DelegateResult<HttpResponseMessage> result,
    TimeSpan timeSpan,
    int retryCount,
    Context context)
    {
        string logMessage = "HttpRequestException caught by retry policy, retrying - {RetryCount}, Status Code: {statusCode}";

        _logger.LogWarning(
            LoggingEvents.HttpRequestRetryException,
            logMessage,
            retryCount,
            result?.Result.StatusCode);
    }
}

