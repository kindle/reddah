namespace Reddah.Core.IoC
{
    using System;
    using System.Collections.Generic;

    public interface IContainer
    {
        IContainer AddService<TService, TComponent>() where TComponent : TService;
        IContainer AddService<TService, TComponent>(string name) where TComponent : TService;
        IContainer AddService(Type serviceType, string name, Type componentType);

        IContainer AddServiceWithLocator<TService, TLocator>()
            where TLocator : ILocator<TService>
            where TService : class;
        IContainer AddServiceWithLocator<TService, TLocator>(string name)
            where TLocator : ILocator<TService>
            where TService : class;

        IContainer AddServiceWithLocatorInstance<TService>(ILocator<TService> instance);
        IContainer AddServiceWithLocatorInstance<TService>(ILocator<TService> instance, string name);

        IContainer AddServiceWithInstance<TService>(TService instance);
        IContainer AddServiceWithInstance<TService>(TService instance, string name);
        IContainer AddServiceWithInstance(Type serviceType, object instance, string name);

        IContainer AddServiceWithFactoryLocator<TService>(Func<IContainer, TService> factory);
        IContainer AddServiceWithFactoryLocator<TService>(Func<IContainer, TService> factory, string name);

        IEnumerable<KeyValuePair<string, T>> GetAllComponents<T>();
        IEnumerable<KeyValuePair<string, object>> GetAllComponents(Type serviceType);

        T GetComponent<T>();
        T GetComponent<T>(string name);

        object GetComponent(Type serviceType);
        object GetComponent(Type serviceType, string name);
        object GetOrAddComponent(Type componentType);

        bool IsRegistered<T>();
        bool IsRegistered<T>(string name);

        void DisposeSingletons();
#if !SILVERLIGHT
        void SetBehaviorsForService<TService>(params IBehavior[] behaviors);
        void SetBehaviorsForServiceByName<TService>(string name, params IBehavior[] behaviors);
#endif
        void SetLifeCycleForService<TService>(LifeCycleMode lifeCycleMode);
        void SetLifeCycleForService<TService>(LifeCycleMode lifeCycleMode, string name);

        IContainer AddCreationInterceptor<TService>(ICreationInterceptor<TService> creationInterceptor);
        IContainer AddCreationInterceptor<TService>(ICreationInterceptor<TService> creationInterceptor, string name);
    }
}
