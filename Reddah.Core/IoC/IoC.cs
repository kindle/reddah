namespace Reddah.Core.IoC
{
    using System;
    using System.Collections.Generic;

    public static class IoC
    {
        public static bool IsRegistered<TService>(string name)
        {
            return Container.Instance.IsRegistered<TService>(name);
        }

        public static bool IsRegistered<TService>()
        {
            return Container.Instance.IsRegistered<TService>();
        }

        public static TService Get<TService>(string name)
        {
            return Container.Instance.GetComponent<TService>(name);
        }

        public static TService Get<TService>()
        {
            return Container.Instance.GetComponent<TService>();
        }

        public static IEnumerable<KeyValuePair<string, TService>> GetAll<TService>()
        {
            return Container.Instance.GetAllComponents<TService>();
        }

#if !SILVERLIGHT
        public static IServiceRegistrationOptions<TService> Register<TService, TComponent>(string name) where TComponent : TService
        {
            Container.Instance.AddService<TService, TComponent>(name);

            return new ServiceRegistrationOptions<TService>();
        }

        public static IServiceRegistrationOptions<TService> Register<TService, TComponent>() where TComponent : TService
        {
            Container.Instance.AddService<TService, TComponent>();

            return new ServiceRegistrationOptions<TService>();
        }
#endif

        public static void RegisterWithInstance<TService>(TService instance, string name)
        {
            Container.Instance.AddServiceWithInstance(instance, name);
        }

        public static void RegisterWithInstance<TService>(TService instance)
        {
            Container.Instance.AddServiceWithInstance(instance);
        }

        public static void RegisterWithLocator<TService, TLocator>(string name)
            where TLocator : ILocator<TService>
            where TService : class
        {
            Container.Instance.AddServiceWithLocator<TService, TLocator>(name);
        }

        public static void RegisterWithLocator<TService, TLocator>()
            where TLocator : ILocator<TService>
            where TService : class
        {
            Container.Instance.AddServiceWithLocator<TService, TLocator>();
        }

        public static void RegisterFactory<TService>(Func<TService> factory, string name)
        {
            Container.Instance.AddServiceWithFactoryLocator(_ => factory(), name);
        }

        public static void RegisterFactory<TService>(Func<TService> factory)
        {
            Container.Instance.AddServiceWithFactoryLocator(_ => factory());
        }
    }
}
