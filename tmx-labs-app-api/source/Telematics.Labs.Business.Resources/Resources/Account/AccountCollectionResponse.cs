using System;
using Progressive.Telematics.Labs.Business.Resources;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Account;

public class AccountCollectionResponse : Resource
{
    public AccountCollectionResponse()
    {
    Accounts = Array.Empty<AccountSummary>();
    }

    public AccountSummary[] Accounts { get; set; }
    public int RecordCount { get; set; }
}
