using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Orchestrators.Vehicle;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Resources.Account;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Business.Resources.Resources.Vehicle;
using Progressive.Telematics.Labs.Services.Database.Models;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Api.Controllers.Vehicle
{
    [Route("Api/[controller]")]
    public class ParticipantController() : TelematicsController<IParticipantOrchestrator>
    {
        [HttpPost("Add")]
        public async Task<AccountCollectionResponse> AddParticipant([FromBody] AddAccountParticipantRequest request)
        {
            return await Orchestrator.AddParticipant(request);
        }

        [HttpPut("EditVehicle")]
        public async Task<EditVehicleResponse> EditVehicle([Required] EditVehicleRequest request)
        {
            return await Orchestrator.EditVehicle(request);
        }

        [HttpPut("updateParticipantNickname")]
        [ProducesResponseType(typeof(UpdateParticipantNicknameResponse), StatusCodes.Status200OK)]
        public Task<UpdateParticipantNicknameResponse> UpdateParticipantNickname([FromBody] UpdateParticipantNicknameRequest request)
        {
            return Orchestrator.UpdateParticipantNickname(request);
        }

        [HttpPost("OptOut")]
        [ProducesResponseType(typeof(Resource), StatusCodes.Status200OK)]
        public Task<Resource> OptOut([FromBody] OptOutParticipantRequest request)
        {
            return Orchestrator.OptOut(request);
        }

        [HttpPost("UpdateVehicleStatus")]
        public async Task<UpdateVehicleStatusResponse> UpdateVehicleStatus([Required] UpdateVehicleStatusRequest request)
        {
            return await Orchestrator.UpdateVehicleStatus(request.ParticipantSeqID, request.IsActive);
        }
    }
}
