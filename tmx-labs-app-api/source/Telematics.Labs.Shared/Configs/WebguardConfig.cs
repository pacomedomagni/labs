using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Shared.Configs
{
	public class WebguardConfig
    {
        public string ApplicationName { get; set; }
        public string ApplicationSubName { get; set; }
        public string ApplicationEnvironmentName { get; set; }
        public IEnumerable<string> AllowedEnvironments { get; set; }
        public string AccessConfigurationFile { get; set; }
        public string LogPath { get; set; }
        public string LogLevel { get; set; }
        public string AuthenticationServiceUrl { get; set; }

    }
}

