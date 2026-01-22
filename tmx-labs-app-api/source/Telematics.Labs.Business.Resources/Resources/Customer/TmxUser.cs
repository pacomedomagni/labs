using Progressive.Telematics.Labs.Business.Resources.Enums;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Customer;

public class LabsUser : Resource
{
    public AccessType AccessType { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string Company { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string FullName { get; set; }
    public string LastName { get; set; }
    public string Password { get; set; }
    public string PasswordAnswer { get; set; }
    public string PasswordQuestion { get; set; }
    public string PasswordResetDate { get; set; }
    public string PhoneNumber { get; set; }
    public string[] Roles { get; set; }
    public string State { get; set; }
    public string UID { get; set; }
    public string UserName { get; set; }
    public string Zip { get; set; }
}
