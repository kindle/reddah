namespace Reddah.Core.IoC
{
    using System;

    public interface ICreationInterceptor
    {
        object CreateInstance(Func<object> creationDelegate);
    }
    public interface ICreationInterceptor<TService> : ICreationInterceptor
    {
        TService CreateInstance(Func<TService> creationDelegate);
    }
}
