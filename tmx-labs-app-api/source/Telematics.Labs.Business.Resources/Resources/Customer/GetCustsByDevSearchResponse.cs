namespace Progressive.Telematics.Labs.Business.Resources.Resources.Customer;

public class GetCustsByDevSearchResponse : Resource
{
    public int RecordCount { get; set; }

    public CustAndDevSearchResult[] SearchResults { get; set; }

    public object Device { get; set; }
}
