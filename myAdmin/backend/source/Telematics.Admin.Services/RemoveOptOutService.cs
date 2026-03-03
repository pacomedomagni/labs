using System.Threading.Tasks;
using Progressive.Telematics.Admin.Business.Resources.Cl;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Database.CommercialLines;

namespace Progressive.Telematics.Admin.Services
{
    public interface IRemoveOptOutService
    {
        Task RemoveOptOut(RemoveOptOutRequest request);
        public Task UpdateVehicle(
            int vehicleSeqId,
            string UpdatedCableType,
            bool UpdatedHeavyTruckFlag
        );
        public Task UpdateParticipantStatus(
            int participantSeqId,
            ParticipantStatusCode participantStatusCode
        );
        public Task<int> CreateDeviceOrder(int policySeqId, bool? isHeavyTruck);
        public Task<int> CreateReplacementDeviceOrderDetails(
            int deviceOrderId,
            int ParticipantSeqId,
            int VehicleSeqId,
            bool IsCableOrderInd
        );
    }

    public class RemoveOptOutService : IRemoveOptOutService
    {
        private readonly ICommercialLineCommands CommercialLineCommands;

        public RemoveOptOutService(ICommercialLineCommands CommercialLineCommands)
        {
            this.CommercialLineCommands = CommercialLineCommands;
        }

        public async Task RemoveOptOut(RemoveOptOutRequest request)
        {
            await CommercialLineCommands.UpdateParticipantStatus(
                request.ParticipantSeqId,
                ParticipantStatusCode.Enrolled
            );

            await CommercialLineCommands.UpdateVehicle(
                request.VehicleSeqId,
                request.UpdatedCableType,
                request.UpdatedHeavyTruckFlag
            );

            await CreateDeviceOrderAndDetails(
                request.PolicySeqId,
                request.ParticipantSeqId,
                request.VehicleSeqId,
                request.UpdatedHeavyTruckFlag
            );
        }

        public async Task UpdateParticipantStatus(
            int participantSeqId,
            ParticipantStatusCode participantStatusCode
        )
        {
            await CommercialLineCommands.UpdateParticipantStatus(
                participantSeqId,
                participantStatusCode
            );
        }

        public async Task UpdateVehicle(
            int vehicleSeqId,
            string UpdatedCableType,
            bool UpdatedHeavyTruckFlag
        )
        {
            await CommercialLineCommands.UpdateVehicle(
                vehicleSeqId,
                UpdatedCableType,
                UpdatedHeavyTruckFlag
            );
        }

        public async Task<int> CreateDeviceOrder(int policySeqId, bool? isHeavyTruck)
        {
            DeviceOrderDto deviceOrder = new DeviceOrderDto
            {
                DeviceOrderStatusCode = 1,
                IsHeavyTruck = isHeavyTruck,
                PolicySeqId = policySeqId
            };
            return await CommercialLineCommands.CreateDeviceOrder(deviceOrder);
        }

        public async Task<int> CreateReplacementDeviceOrderDetails(
            int deviceOrderId,
            int ParticipantSeqId,
            int VehicleSeqId,
            bool IsCableOrderInd
        )
        {
            return await CommercialLineCommands.CreateDeviceOrderDetail(
                new DeviceOrderDetailDto
                {
                    DeviceOrderId = deviceOrderId,
                    IsReplacementOrder = true,
                    ParticipantSeqId = ParticipantSeqId,
                    VehicleSeqId = VehicleSeqId,
                    IsCableOrderInd = IsCableOrderInd
                }
            );
        }

        private async Task CreateDeviceOrderAndDetails(
            int policySeqId,
            int ParticipantSeqId,
            int VehicleSeqId,
            bool? isHeavyTruck
        )
        {
            DeviceOrderDto deviceOrder = new DeviceOrderDto
            {
                DeviceOrderStatusCode = 1,
                IsHeavyTruck = isHeavyTruck,
                PolicySeqId = policySeqId
            };
            int deviceOrderId = await CommercialLineCommands.CreateDeviceOrder(deviceOrder);

            await CommercialLineCommands.CreateDeviceOrderDetail(
                new DeviceOrderDetailDto
                {
                    DeviceOrderId = deviceOrderId,
                    IsReplacementOrder = true,
                    ParticipantSeqId = ParticipantSeqId,
                    VehicleSeqId = VehicleSeqId
                }
            );
        }
    }
}
