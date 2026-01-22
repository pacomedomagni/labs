using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Progressive.Telematics.Labs.Shared.Attributes;
using Xunit;

namespace Progressive.Telematics.Labs.Business.Tests
{
    public class ErrorCodeTests
    {
        [Fact]
        public void EnsureErrorCodesAreUnique()
        {
            var assemblies = new List<string>
            {
                "Progressive.Telematics.Labs.Business",
                "Progressive.Telematics.Labs.Services"
            };

            var errorCodes = new List<int>();
            assemblies.ForEach(x =>
                errorCodes.AddRange(
                    Assembly.Load(x)
                        .GetTypes()
                        .Where(x => x.IsInterface)
                        .SelectMany(x => x.GetMethods())
                        .Where(x => x.GetCustomAttribute<ErrorCodeAttribute>() != null)
                        .Select(x => x.GetCustomAttribute<ErrorCodeAttribute>().ErrorCode)
                )
            );

            var duplicates = errorCodes.GroupBy(x => x).SelectMany(x => x.Skip(1));
            Assert.Empty(duplicates);
        }
    }
}

