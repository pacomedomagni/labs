namespace Progressive.Telematics.Labs.Shared.Configs;

public class HttpRetryConfig
{
    public int TransientHTTPErrorMaxRetryAttempts { get; set; }
    public int TransientHTTPErrorMedianFirstRetryDelayMs { get; set; }
}

