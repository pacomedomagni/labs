using System.Text.Json.Serialization;
using TypeLitePlus;

namespace WcfIneligibleVehiclesService
{
    [TsClass]
    public partial class IneligibleVehicle
    {
        [TsIgnore]
        [JsonPropertyName("ymm")]
        public string YMM
        {
            get
            {
                return string.Join(' ', ModelYear, Make, Model);
            }
        }
    }
}
