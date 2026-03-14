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
    public class UnenrollSnapshotMobileParticipantCommandTests
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
                }
            };
            Assert.NotNull(new UnenrollSnapshotMobileParticipantCommand(sp));
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
                }
            };
            
            Assert.Throws<ValidationException>(() => new UnenrollSnapshotMobileParticipantCommand(sp));
        }
    }
}
