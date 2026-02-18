using System.Collections.Generic;
using System.Linq;
using Progressive.Telematics.Labs.Business.Resources.Enums;


namespace Progressive.Telematics.Labs.Business.Resources
{
    public class Resource : IResource
    {
        public Dictionary<string, object> Extenders { get; set; }
        public Dictionary<MessageCode, object> Messages { get; set; }
    }

    public interface IResource
    {
        Dictionary<string, object> Extenders { get; set; }
        Dictionary<MessageCode, object> Messages { get; set; }
    }
}

namespace Progressive.Telematics.Labs.Business.Resources.Shared
{
    public static class ResourceExtensions
    {
        public static Resource AddExtender(this Resource resource, string key, object value)
        {
            if (resource.Extenders == null) resource.Extenders = new Dictionary<string, object>();
            if (resource.Extenders.ContainsKey(key))
                resource.Extenders[key] = value;
            else
                resource.Extenders.Add(key, value);
            return resource;
        }

        public static Resource AddExtenders(this Resource resource, Dictionary<string, object> extenders)
        {
            if (extenders != null)
            {
                if (resource.Extenders == null)
                {
                    resource.Extenders = new Dictionary<string, object>();
                }

                foreach (KeyValuePair<string, object> entry in extenders)
                {
                    if (!resource.Extenders.ContainsKey(entry.Key))
                    {
                        resource.AddExtender(entry.Key, entry.Value);
                    }
                }
            }
            return resource;
        }

        public static Resource AddMessage(this Resource resource, MessageCode key, object value)
        {
            if (resource.Messages == null) resource.Messages = new Dictionary<MessageCode, object>();
            if (resource.Messages.ContainsKey(key))
                resource.Messages[key] = value;
            else
                resource.Messages.Add(key, value);
            return resource;
        }

        public static bool HasErrorCode(this Resource resource, string errorMessage)
        {
            if(errorMessage == null || resource == null || resource.Messages == null)
            {
                return false;
            }

            return resource.Messages.Any(m =>
                m.Key == MessageCode.ErrorCode &&
                m.Value.ToString() == errorMessage);
        }
    }
}

