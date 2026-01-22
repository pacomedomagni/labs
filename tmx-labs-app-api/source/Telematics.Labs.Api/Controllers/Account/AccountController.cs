using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Orchestrators.Account;
using Progressive.Telematics.Labs.Business.Resources.Resources.Account;

namespace Progressive.Telematics.Labs.Api.Controllers.Account
{
    public class AccountController : TelematicsController<IAccountOrchestrator>
    {
        [HttpGet("getAccountsByParticipantGroupSeqId")]
        [ProducesResponseType(typeof(AccountCollectionResponse), StatusCodes.Status200OK)]
        public Task<AccountCollectionResponse> GetAccountsByParticipantGroupSeqId([Required] int participantGroupSeqId)
        {
            return Orchestrator.GetAccountsByParticipantGroupSeqId(participantGroupSeqId);
        }
    }
}
