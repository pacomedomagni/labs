using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.UserManagement;
public class AddAccountRequest
{
    public string LastName { get; set; }
    public string UserName { get; set; }
    public List<AddAccountDriverVehicleInformation> DriversVehicles { get; set; }

    public string Address { get; set; }
    public string City { get; set; }
    public string Company { get; set; }
    public string FirstName { get; set; }
    public string FullName { get; set; }
    public string Password { get; set; }
    public string PasswordAnswer { get; set; }
    public string PasswordQuestion { get; set; }
    public string PhoneNumber { get; set; }
    public string State { get; set; }
    public string Zip { get; set; }
}

public class AddAccountDriverVehicleInformation
{
    public AddVehicleModel Vehicle { get; set; }
    public int ScoringAlgorithmCode { get; set; }
}

public class AddVehicleModel
{
    public int Year { get; set; }
    public string Make { get; set; }
    public string Model { get; set; }
    public string VIN { get; set; }

}
