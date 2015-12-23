

namespace Reddah.Core.IoC
{
    using System;
    using System.Collections.Generic;
    using System.Linq;

    public class Container : IContainer
    {
        private static IContainer containerInstance = new Container();
        public static IContainer Instance { get { return containerInstance; } }

        private readonly Func<IEnumerable<KeyValuePair<string, ComponentInfo>>, IDictionary<string, ComponentInfo>> newDictionary = pairs =>
#if SILVERLIGHT
            new Dictionary<string, ComponentInfo>(pairs.ToDictionary(p => p.Key, p => p.Value));
#else
 new System.Collections.Concurrent.ConcurrentDictionary<string, ComponentInfo>(pairs);
#endif

        readonly IDictionary<Type, IDictionary<string, ComponentInfo>> serviceRegistry =
#if SILVERLIGHT
            new Dictionary<Type, IDictionary<string, ComponentInfo>>();
#else
 new System.Collections.Concurrent.ConcurrentDictionary<Type, IDictionary<string, ComponentInfo>>();
#endif

        public IEnumerable<KeyValuePair<string, T>> GetAllComponents<T>()
        {
            return GetAllComponents(typeof(T)).Select(pair => new KeyValuePair<string, T>(pair.Key, (T)pair.Value));
        }

        public IEnumerable<KeyValuePair<string, object>> GetAllComponents(Type serviceType)
        {
            IDictionary<string, ComponentInfo> componentInfoList;

            try
            {
                componentInfoList = serviceRegistry[serviceType];
            }
            catch (KeyNotFoundException)
            {
                componentInfoList = newDictionary(Enumerable.Empty<KeyValuePair<string, ComponentInfo>>());
                serviceRegistry.Add(serviceType, componentInfoList);
            }

            return componentInfoList.Select(componentInfo => new KeyValuePair<string, object>(componentInfo.Key, componentInfo.Value.GetComponent()));
        }

        public T GetComponent<T>()
        {
            return (T)GetComponent(typeof(T), string.Empty);
        }

        public T GetComponent<T>(string name)
        {
            return (T)GetComponent(typeof(T), name);
        }

        public object GetComponent(Type serviceType)
        {
            return GetComponent(serviceType, string.Empty);
        }

        public object GetComponent(Type serviceType, string name)
        {
            IDictionary<string, ComponentInfo> componentInfoList;

            // First make sure the serviceType is in the service registry
            try
            {
                componentInfoList = serviceRegistry[serviceType];
            }
            catch (KeyNotFoundException)
            {
                //throw new ServiceNotRegisteredException("Interface '" + serviceType + "' was not registered with the IoC container.");
                throw new Exception("Interface '" + serviceType + "' was not registered with the IoC container.");
            }

            // Now check if the given name is in the list
            object component;
            try
            {
                var componentInfo = componentInfoList[name];
                component = componentInfo.GetComponent();
            }
            catch (KeyNotFoundException)
            {
                //throw new ServiceNotRegisteredException("Interface '" + serviceType + "' with name '" + name + "' was not registered with the IoC container.");
                throw new Exception("Interface '" + serviceType + "' with name '" + name + "' was not registered with the IoC container.");
            }

            return component;
        }

        public object GetOrAddComponent(Type componentType)
        {
            try
            {
                return GetComponent(componentType);
            }
            //catch (ServiceNotRegisteredException)
            catch (Exception)
            {
                AddService(componentType, "", componentType);
            }

            return GetComponent(componentType);
        }

        public bool IsRegistered<T>()
        {
            return IsRegistered<T>(string.Empty);
        }

        public bool IsRegistered<T>(string name)
        {
            return IsRegistered(typeof(T), name);
        }

        private bool IsRegistered(Type componentType, string name = "")
        {
            if (!serviceRegistry.ContainsKey(componentType))
            {
                return false;
            }

            var componentInfoList = serviceRegistry[componentType];
            return componentInfoList.ContainsKey(name);
        }

        public void DisposeSingletons()
        {
            ComponentInfo.DisposeSingletons();
        }

#if !SILVERLIGHT
        //Not valid in silverlight.  Causes MethodAccessException when ComponentInfo.CreateProxyInstantiator() is called.
        //"attempt by security transparent method to access critical method System.Reflection.Emit.DynamicMethod..ctor..."
        public void SetBehaviorsForService<TService>(params IBehavior[] behaviors)
        {
            SetBehaviorsForServiceInternal(typeof(TService), string.Empty, behaviors);
        }

        public void SetBehaviorsForServiceByName<TService>(string name, params IBehavior[] behaviors)
        {
            SetBehaviorsForServiceInternal(typeof(TService), name, behaviors);
        }

        private void SetBehaviorsForServiceInternal(Type serviceType, string name, IBehavior[] behaviors)
        {
            IDictionary<string, ComponentInfo> componentInfoList;
            try
            {
                componentInfoList = serviceRegistry[serviceType];
            }
            catch (KeyNotFoundException)
            {
                //throw new ServiceNotRegisteredException("Interface '" + serviceType + "' was not registered with the IoC container.");
                throw new Exception("Interface '" + serviceType + "' was not registered with the IoC container.");
            }

            try
            {
                var componentInfo = componentInfoList[name];
                componentInfo.SetServiceBehaviors(behaviors);
            }
            catch (KeyNotFoundException)
            {
                //throw new ServiceNotRegisteredException("Interface '" + serviceType + "' was not registered with the IoC container.");
                throw new Exception("Interface '" + serviceType + "' was not registered with the IoC container.");
            }
        }
#endif

        public void SetLifeCycleForService<TService>(LifeCycleMode lifeCycleMode)
        {
            Type serviceType = typeof(TService);
            IDictionary<string, ComponentInfo> componentInfoList;
            try
            {
                componentInfoList = serviceRegistry[serviceType];
            }
            catch (KeyNotFoundException)
            {
                //throw new ServiceNotRegisteredException("Interface '" + serviceType + "' was not registered with the IoC container.");
                throw new Exception("Interface '" + serviceType + "' was not registered with the IoC container.");
            }

            foreach (var componentInfo in componentInfoList)
            {
                componentInfo.Value.LifeCycleMode = lifeCycleMode;
            }
        }

        public void SetLifeCycleForService<TService>(LifeCycleMode lifeCycleMode, string name)
        {
            SetLifeCycleForServiceInternal(typeof(TService), lifeCycleMode, name);
        }

        private void SetLifeCycleForServiceInternal(Type serviceType, LifeCycleMode lifeCycleMode, string name)
        {
            IDictionary<string, ComponentInfo> componentInfoList;
            try
            {
                componentInfoList = serviceRegistry[serviceType];
            }
            catch (KeyNotFoundException)
            {
                //throw new ServiceNotRegisteredException("Interface '" + serviceType + "' was not registered with the IoC container.");
                throw new Exception("Interface '" + serviceType + "' was not registered with the IoC container.");
            }

            try
            {
                var componentInfo = componentInfoList[name];
                componentInfo.LifeCycleMode = lifeCycleMode;
            }
            catch (KeyNotFoundException)
            {
                //throw new ServiceNotRegisteredException("Interface '" + serviceType + "' was not registered with the IoC container.");
                throw new Exception("Interface '" + serviceType + "' was not registered with the IoC container.");
            }
        }

        public IContainer AddCreationInterceptor<TService>(ICreationInterceptor<TService> creationInterceptor)
        {
            Type serviceType = typeof(TService);
            IDictionary<string, ComponentInfo> componentInfoList;
            try
            {
                componentInfoList = serviceRegistry[serviceType];
            }
            catch (KeyNotFoundException)
            {
                //throw new ServiceNotRegisteredException("Interface '" + serviceType + "' was not registered with the IoC container.");
                throw new Exception("Interface '" + serviceType + "' was not registered with the IoC container.");
            }

            foreach (var componentInfo in componentInfoList)
            {
                componentInfo.Value.AddCreationInterceptor(creationInterceptor);
            }

            return this;
        }

        public IContainer AddCreationInterceptor<TService>(ICreationInterceptor<TService> creationInterceptor, string name)
        {
            AddCreationInterceptorInternal(typeof(TService), creationInterceptor, name);
            return this;
        }

        private void AddCreationInterceptorInternal(Type serviceType, ICreationInterceptor creationInterceptor, string name)
        {
            IDictionary<string, ComponentInfo> componentInfoList;
            try
            {
                componentInfoList = serviceRegistry[serviceType];
            }
            catch (KeyNotFoundException)
            {
                //throw new ServiceNotRegisteredException("Interface '" + serviceType + "' was not registered with the IoC container.");
                throw new Exception("Interface '" + serviceType + "' was not registered with the IoC container.");
            }

            try
            {
                var componentInfo = componentInfoList[name];
                componentInfo.AddCreationInterceptor(creationInterceptor);
            }
            catch (KeyNotFoundException)
            {
                //throw new ServiceNotRegisteredException("Interface '" + serviceType + "' was not registered with the IoC container.");
                throw new Exception("Interface '" + serviceType + "' was not registered with the IoC container.");
            }
        }

        public IContainer AddService<TService, TComponent>() where TComponent : TService
        {
            Type serviceType = typeof(TService);
            Type componentType = typeof(TComponent);

            return AddService(serviceType, string.Empty, componentType);
        }

        public IContainer AddService<TService, TComponent>(string name) where TComponent : TService
        {
            Type serviceType = typeof(TService);
            Type componentType = typeof(TComponent);

            return AddServiceInternal(serviceType, name, componentType);
        }

        public IContainer AddService(Type serviceType, string name, Type componentType)
        {
            if (!serviceType.IsAssignableFrom(componentType))
            {
                throw new ArgumentException(String.Format("Error registering implementation '{0}' as '{1}'. Types are not assignable", serviceType, componentType));
            }

            return AddServiceInternal(serviceType, name, componentType);
        }

        private IContainer AddServiceInternal(Type serviceType, string name, Type componentType)
        {
            if (serviceRegistry.ContainsKey(serviceType))
            {
                IDictionary<string, ComponentInfo> componentInfoList = serviceRegistry[serviceType];

                if (componentInfoList.ContainsKey(name))
                {
                    var componentInfo = componentInfoList[name];
                    if (componentInfo.ComponentType != componentType)
                    {
                        throw new ArgumentException(
                            String.Format(
                                "Attempting to register implementation of '{0}' as '{1}' but it's already registered as '{2}'.",
                                serviceType.FullName, componentType.FullName, componentInfo.ComponentType.FullName),
                            "serviceType");
                    }
                }
                else
                {
                    componentInfoList.Add(name, new ComponentInfo(this, serviceType, componentType));
                }
            }
            else
            {
                serviceRegistry.Add(serviceType, newDictionary(new[]
                                                    {
                                                        new KeyValuePair<string, ComponentInfo>(name, new ComponentInfo(this, serviceType, componentType))
                                                    }));
            }

            return this;
        }

        public IContainer AddServiceWithLocator<TService, TLocator>()
            where TLocator : ILocator<TService>
            where TService : class
        {
            Type serviceType = typeof(TService);
            Type locatorType = typeof(TLocator);

            return AddServiceInternal(serviceType, string.Empty, locatorType);
        }

        public IContainer AddServiceWithLocator<TService, TLocator>(string name)
            where TLocator : ILocator<TService>
            where TService : class
        {
            Type serviceType = typeof(TService);
            Type locatorType = typeof(TLocator);

            return AddServiceInternal(serviceType, name, locatorType);
        }

        public IContainer AddServiceWithLocatorInstance<TService>(ILocator<TService> instance)
        {
            return AddServiceWithLocatorInstance(instance, string.Empty);
        }

        public IContainer AddServiceWithLocatorInstance<TService>(ILocator<TService> instance, string name)
        {
            var serviceType = typeof(TService);

            if (!serviceRegistry.ContainsKey(serviceType))
            {
                serviceRegistry.Add(serviceType, newDictionary(new[]
                                                    {
                                                        new KeyValuePair<string, ComponentInfo>(name, new ComponentInfo(this, serviceType, instance))
                                                    }));
                SetLifeCycleForService<TService>(LifeCycleMode.Instance, name); // Default is Instance
            }
            else
            {
                var componentInfos = serviceRegistry[serviceType];

                if (!componentInfos.ContainsKey(name))
                {
                    componentInfos.Add(name, new ComponentInfo(this, serviceType, instance));
                    SetLifeCycleForService<TService>(LifeCycleMode.Instance, name); // Default is Instance
                }
                else
                {
                    throw new InvalidOperationException(
                        String.Format(
                            "Attempting to register instance for '{0}' but it's already regsitered with '{1}'",
                            serviceType.FullName, componentInfos[name].ComponentType.FullName));
                }
            }

            return this;
        }

        public IContainer AddServiceWithInstance<TService>(TService instance)
        {
            return AddServiceWithInstance(instance, string.Empty);
        }

        public IContainer AddServiceWithInstance<TService>(TService instance, string name)
        {
            return AddServiceWithInstance(typeof(TService), instance, name);
        }

        public IContainer AddServiceWithInstance(Type serviceType, object instance, string name)
        {
            if (!serviceRegistry.ContainsKey(serviceType))
            {
                serviceRegistry.Add(serviceType, newDictionary(new[]
                                                    {
                                                        new KeyValuePair<string, ComponentInfo>(name, new ComponentInfo(this, serviceType, instance))
                                                    }));
            }
            else
            {
                var componentInfos = serviceRegistry[serviceType];

                if (!componentInfos.ContainsKey(name))
                {
                    componentInfos.Add(name, new ComponentInfo(this, serviceType, instance));
                }
                else
                {
                    throw new InvalidOperationException(
                        String.Format(
                            "Attempting to register instance for '{0}' but it's already registered with '{1}'",
                            serviceType.FullName, componentInfos[name].ComponentType.FullName));
                }
            }

            return this;
        }

        public IContainer AddServiceWithFactoryLocator<TService>(Func<IContainer, TService> factory)
        {
            return AddServiceWithFactoryLocator(factory, string.Empty);
        }

        public IContainer AddServiceWithFactoryLocator<TService>(Func<IContainer, TService> factory, string name)
        {
            return AddServiceWithLocatorInstance(new AnonymousLocator<TService>(this, factory), name);
        }

        public static void UseLocalContainer(IContainer localContainer)
        {
            ComponentInfo.DisposeSingletons();
            containerInstance = localContainer;
        }

        private class AnonymousLocator<T> : ILocator<T>
        {
            private readonly IContainer container;
            private readonly Func<IContainer, T> factory;
            public AnonymousLocator(IContainer container, Func<IContainer, T> factory)
            {
                this.container = container;
                this.factory = factory;
            }

            public T LocateComponent()
            {
                return factory(container);
            }

            object ILocator.LocateComponent()
            {
                return LocateComponent();
            }
        }
    }
}
