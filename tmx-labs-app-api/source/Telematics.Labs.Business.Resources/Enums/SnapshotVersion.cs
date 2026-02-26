using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Resources.Enums
{
    /// <summary>
    /// Maps MobileSummarizerVersionCode values to Snapshot program versions.
    /// </summary>
    public enum SnapshotVersion
    {
        Snapshot3 = 3,
        Snapshot4 = 4,
        Snapshot5 = 5
    }

    public static class SnapshotVersionMap
    {
        private static readonly Dictionary<int, string> Descriptions = new()
        {
            { (int)SnapshotVersion.Snapshot3, "3.0" },
            { (int)SnapshotVersion.Snapshot4, "4.0" },
            { (int)SnapshotVersion.Snapshot5, "5.0" }
        };

        public static string GetDescription(int versionCode)
        {
            return Descriptions.TryGetValue(versionCode, out var description) ? description : null;
        }
    }
}
