using System;

namespace Progressive.Telematics.Labs.Shared.Attributes
{
    /// <summary>
    /// The <see cref="IHostedService"/> containing this <see cref="Attribute"/> will automatically be registered in <see cref="IServiceCollection"/>
    /// with <see cref="ServiceLifetime.Singleton"/> lifetime.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false)]
    public sealed class HostedServiceAttribute : Attribute
    {
    }

    /// <summary>
    /// The services containing this <c>Attribute</c> will automatically be registered in <see cref="IServiceCollection"/>
    /// with <see cref="ServiceLifetime.Scoped"/> lifetime.
    /// </summary>
    [AttributeUsage(AttributeTargets.Interface | AttributeTargets.Class, AllowMultiple = false)]
    public sealed class ScopedServiceAttribute : Attribute
    {
    }

    /// <summary>
    /// The services containing this <c>Attribute</c> will automatically be registered in <see cref="IServiceCollection"/>
    /// with <see cref="ServiceLifetime.Singleton"/> lifetime.
    /// </summary>
    [AttributeUsage(AttributeTargets.Interface | AttributeTargets.Class, AllowMultiple = false)]
    public sealed class SingletonServiceAttribute : Attribute
    {
    }

    /// <summary>
    /// The services containing this <c>Attribute</c> will automatically be registered in <see cref="IServiceCollection"/>
    /// with <see cref="ServiceLifetime.Transient"/> lifetime.
    /// </summary>
    [AttributeUsage(AttributeTargets.Interface | AttributeTargets.Class, AllowMultiple = false)]
    public sealed class TransientServiceAttribute : Attribute
    {
    }
}

