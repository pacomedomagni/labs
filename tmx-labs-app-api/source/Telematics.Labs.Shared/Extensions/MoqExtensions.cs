using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Moq;

namespace Progressive.Telematics.Labs.Shared
{
    public static class MoqExtensions
    {
        public static void ExpectCritical<T>(this Mock<ILogger<T>> logger, EventId? eventId = null, string expectedMessage = "")
        {
            Expect(logger, LogLevel.Critical, eventId, expectedMessage);
        }

        public static void ExpectDebug<T>(this Mock<ILogger<T>> logger, EventId? eventId = null, string expectedMessage = "")
        {
            Expect(logger, LogLevel.Debug, eventId, expectedMessage);
        }

        public static void ExpectError<T>(this Mock<ILogger<T>> logger, EventId? eventId = null, string expectedMessage = "")
        {
            Expect(logger, LogLevel.Error, eventId, expectedMessage);
        }

        public static void ExpectInformation<T>(this Mock<ILogger<T>> logger, EventId? eventId = null, string expectedMessage = "")
        {
            Expect(logger, LogLevel.Information, eventId, expectedMessage);
        }

        public static void ExpectTrace<T>(this Mock<ILogger<T>> logger, EventId? eventId = null, string expectedMessage = "")
        {
            Expect(logger, LogLevel.Trace, eventId, expectedMessage);
        }

        public static void ExpectWarning<T>(this Mock<ILogger<T>> logger, EventId? eventId = null, string expectedMessage = "")
        {
            Expect(logger, LogLevel.Warning, eventId, expectedMessage);
        }

        public static void ExpectPerformance<T>(this Mock<ILogger<T>> logger)
        {
            Expect(logger, LogLevel.Information, new EventId(2000));
        }

        public static void Expect<T>(this Mock<ILogger<T>> logger, LogLevel expectedLogLevel, EventId? eventId, string expectedMessage = "")
        {
            eventId = eventId == null ? new EventId(0) : eventId;

            Func<object, Type, bool> state = (y, z) =>
            {
                var count = (int)y.GetType().GetProperty("Count").GetValue(y);
                var prop = y.GetType().GetProperty("Item");
                var origMessage = ((KeyValuePair<string, object>)prop.GetValue(y, new object[] { count - 1 })).Value;
                var formatMatch = string.IsNullOrWhiteSpace(expectedMessage) ? true : origMessage.ToString().Equals(expectedMessage);

                var matches = Regex.Matches(expectedMessage, "{(.*?)}");
                var trueMessage = expectedMessage;
                for (int i = 0; i < matches.Count; i++)
                {
                    trueMessage = trueMessage.Replace(matches[i].Value, ((KeyValuePair<string, object>)prop.GetValue(y, new object[] { i })).Value.ToString());
                }
                var contentMatch = string.IsNullOrWhiteSpace(expectedMessage) ? true : y.ToString().Equals(trueMessage);

                return formatMatch && contentMatch;
            };

            logger.Setup(
                x => x.Log(
                    It.Is<LogLevel>(y => y == expectedLogLevel),
                    It.Is<EventId>(y => eventId == 0 ? true : y == eventId),
                    It.Is<It.IsAnyType>((y, z) => state(y, z)),
                    It.IsAny<Exception>(),
                    It.Is<Func<Moq.It.IsAnyType, Exception, string>>((y, z) => true)))
                .Verifiable();
        }
    }
}

