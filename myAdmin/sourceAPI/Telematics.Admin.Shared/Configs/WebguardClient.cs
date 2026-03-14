using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Shared.Configs
{
    public class WebguardClient
    {
        public string AuthenticationServiceUrl { get; set; }
        public string ModernAuthorizationServiceUrl { get; set; }
        public string ClientIdName { get; set; }
        public string ClientSecretName { get; set; }
    }
}
