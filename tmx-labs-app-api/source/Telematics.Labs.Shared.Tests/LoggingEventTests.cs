using System.Linq;
using System.Reflection;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Progressive.Telematics.Labs.Shared.Tests
{
    public class LoggingEventTests
    {
        [Fact]
        public void EnsureErrorCodesAreUnique()
        {
            var errorCodes = typeof(LoggingEvents)
                .GetFields(BindingFlags.Public | BindingFlags.Static)
                .Select(x => ((EventId)x.GetValue(null)).Id);

            var duplicates = errorCodes.GroupBy(x => x).SelectMany(x => x.Skip(1));
            Assert.Empty(duplicates);
        }
    }
}

