using System;

namespace Progressive.Telematics.Admin.Shared.Attributes
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Interface, Inherited = true)]
    public sealed class ErrorCodeAttribute : Attribute
    {
        public int ErrorCode { get; internal set; }

        public ErrorCodeAttribute() { }

        public ErrorCodeAttribute(int errorCode)
        {
            ErrorCode = errorCode;
        }
    }
}
