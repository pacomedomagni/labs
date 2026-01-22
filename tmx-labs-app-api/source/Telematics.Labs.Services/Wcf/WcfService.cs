using System;
using Microsoft.Extensions.Logging;

namespace Progressive.Telematics.Labs.Services.Wcf
{

    public abstract class WcfService<T>
    {
        private readonly Func<T> factory;
        protected readonly ILogger logger;

        protected WcfService(ILogger logger, Func<T> factory)
        {
            this.factory = factory;
            this.logger = logger;
        }

        public T CreateClient()
        {
            return factory();
        }
    }
}

