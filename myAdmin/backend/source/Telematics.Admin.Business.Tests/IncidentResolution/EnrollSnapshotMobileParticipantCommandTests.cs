using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Progressive.Telematics.Admin.Business.Commands;
using Progressive.Telematics.Admin.Business.Resources;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.IncidentResolution
{
    public class EnrollSnapshotMobileParticipantCommandTests
    {

        [Fact]
        public void ValidationSuccess()
        {

            var sp = new SPParameter[]
            {
                new SPParameter
                {
                    Name = "PolicyNumber",
                    Value = "12345"
                },
                new SPParameter
                {
                    Name = "ParticipantId",
                    Value = "abc-efg"
                },
                new SPParameter
                {
                    Name = "PhoneNumber",
                    Value = "5555551212"
                }
            };
            Assert.NotNull(new EnrollSnapshotMobileParticipantCommand(sp));
        }

        [Fact]
        public void ValidationFailure()
        {

            var sp = new SPParameter[]
            {
                new SPParameter
                {
                    Name = "PolicyNumber",
                    Value = "12345"
                },
                new SPParameter
                {
                    Name = "ParticipantExternalId",
                    Value = "abc-efg"
                },
                new SPParameter
                {
                    Name = "DriverReferenceId",
                    Value = "1"
                }
            };
            
            Assert.Throws<ValidationException>(() => new EnrollSnapshotMobileParticipantCommand(sp));
        }
    }
}
