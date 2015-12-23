namespace Reddah.Core.IoC
{
    using System;

    [AttributeUsage(AttributeTargets.Class)]
    public sealed class PerWebRequestInstanceAttribute : Attribute
    {
    }
}
