using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Shared.Utils;
public static class Helper
{
    public static bool AreEqualGuids(string guid1, string guid2)
    {
        if (string.IsNullOrEmpty(guid1) || string.IsNullOrEmpty(guid2))
        {
            return false;
        }

        return Guid.Parse(guid1) == Guid.Parse(guid2);
    }
}
