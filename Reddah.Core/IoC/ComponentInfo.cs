namespace Reddah.Core.IoC
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Linq;
    using System.Reflection;
    using System.Reflection.Emit;

#if !SILVERLIGHT
    using System.Web;
#endif 

    public enum LifeCycleMode
    {
        Instance,
        Singleton,
        PerThread,
#if !SILVERLIGHT
        PerWebRequest,
#endif
    }

    internal class ComponentInfo
    {
        private IContainer Container { get; set; }
        internal Type ServiceType { get; set; }
        internal Type ComponentType { get; set; }
        internal Type ProxyType { get; set; }
        internal ParameterInfo[] ConstructorParameters { get; set; }
        internal LifeCycleMode LifeCycleMode { get; set; }
        protected IBehavior[] Behaviors { get; set; }
        protected List<ICreationInterceptor> CreationInterceptors { get; set; }

        private delegate object InstantiatorSignature();
        private delegate object InstantiatorSignatureWithParams(object[] dependencies);
        private delegate object ProxyInstantiatorSignature(object component, object[] behaviors);
        private InstantiatorSignature InstantiatorDelegate { get; set; }
        private InstantiatorSignatureWithParams InstantiatorDelegateWithParams { get; set; }
        private ProxyInstantiatorSignature ProxyInstantiatorDelegate { get; set; }
        private object ComponentInstance { get; set; }

        internal string ComponentKey { get; private set; }

        private static readonly object singletonLock = new object();
        private static readonly Dictionary<Type, object> singletonInstances = new Dictionary<Type, object>();

        [ThreadStatic]
        private static Dictionary<Type, object> perThreadInstances;


        /// <summary>
        /// This constructor does the majority of the work to prepare for object creation later.
        /// Constructor structure is inspected and parameter types are cached. 
        /// The constructor then generates DynamicMethods to instantiate the component with
        /// or without parameters (two cases are hendled separately for clarity and performance).
        /// </summary>
        /// <param name="container">The container is used to resolve dependencies during creation.</param>
        /// <param name="serviceType">Type of the service.</param>
        /// <param name="componentType">Type of the component to create the wrapper for.</param>
        internal ComponentInfo(IContainer container, Type serviceType, Type componentType)
        {
            Initialize(container, serviceType, componentType);
            CreateInstantiatorDelegate(componentType);
            DetermineDefaultLifecycleMode();
        }

        internal ComponentInfo(IContainer container, Type serviceType, object instance)
        {
            Initialize(container, serviceType, instance.GetType());
            ComponentInstance = instance;
            // Components with a specific instance should always be singletons.
            LifeCycleMode = LifeCycleMode.Singleton;
        }

        private void Initialize(IContainer container, Type serviceType, Type componentType)
        {
            Container = container;
            ServiceType = serviceType;
            ComponentType = componentType;

            ComponentKey = String.Format(CultureInfo.InvariantCulture, "IoCCo_{0}_Instance", componentType.FullName);
            CreationInterceptors = new List<ICreationInterceptor>();
        }

        private void DetermineDefaultLifecycleMode()
        {
            if (HasCustomAttribute<SingletonInstanceAttribute>())
            {
                LifeCycleMode = LifeCycleMode.Singleton;
            }
            else if (HasCustomAttribute<PerThreadInstanceAttribute>())
            {
                LifeCycleMode = LifeCycleMode.PerThread;
            }
#if !SILVERLIGHT
            else if (HasCustomAttribute<PerWebRequestInstanceAttribute>())
            {
                LifeCycleMode = LifeCycleMode.PerWebRequest;
            }
#endif
            else
            {
                LifeCycleMode = LifeCycleMode.Instance;
            }
        }

        private void CreateInstantiatorDelegate(Type componentType)
        {
            var constructors = componentType.GetConstructors();

            if (constructors.Length != 1)
            {
                throw new ArgumentException("Components must have one and only one public constructor.", "componentType");
            }

            var constructor = constructors[0];
            var parameters = constructor.GetParameters();

            if (parameters.Length == 0)
            {
                // This is where the magic happens for parameterless construction.
                // A method is emitted and a delegate for it is created. The method simply creates a new instance
                // of the component. Later calls to the delegate are fast.
                // this is all done to avoid using Reflection at creation time (Activator specifically).
                CreateParameterlessInstantiator(componentType, constructor);
            }
            else
            {
#if SILVERLIGHT
                throw new ArgumentException("Silverlight cannot handle construction with dependencies.");
#else
                InstantiatorDelegate = null;

                // This is where the magic happens for construction with dependencies.
                // A method is emitted and a delegate for it is created. The method expects an array of objects.
                // It then pushes each element of the array onto the stack to be used as parameters to the constructor
                // and calls the constructor of the component. 
                // Since we know parameter count, no loop is necessary and it is unrolled.
                // this is all done to avoid using Reflection at creation time (Activator with parameters 
                // is especially expensive).
                CreateParameterizedInstantiator(componentType, constructor, parameters);
#endif
            }
        }

#if !SILVERLIGHT
        private void CreateParameterizedInstantiator(Type componentType, ConstructorInfo constructor, ParameterInfo[] parameters)
        {
            var instantiatorMethod =
                new DynamicMethod("CreateInstance_Of_" + componentType.Name,
                                  componentType,
                                  new Type[] { typeof(object[]) },
                                  typeof(ComponentInfo),
                                  skipVisibility: true);
            {
                var generator = instantiatorMethod.GetILGenerator();

                // the loop basicaly outputs 
                //      PUSH argumentArray[0]
                //      PUSH argumentArray[1]
                // etc...
                for (int index = 0; index < parameters.Length; index++)
                {
                    // put reference to the array onto the stack (argument 0)
                    generator.Emit(OpCodes.Ldarg_0);
                    // put next parameter index onto the stack
                    //generator.
                    generator.LoadInt32Constant(index);
                    // dereference the array (1 back on the stack) element with index on top of the stack
                    generator.Emit(OpCodes.Ldelem_Ref);
                }
                // calling the contructor puts a reference to the new onject onto the stack
                generator.Emit(OpCodes.Newobj, constructor);
                // return newly created object reference
                generator.Emit(OpCodes.Ret);
            }

            ConstructorParameters = parameters;
            InstantiatorDelegateWithParams = (InstantiatorSignatureWithParams)instantiatorMethod.CreateDelegate(typeof(InstantiatorSignatureWithParams));
        }
#endif

        private void CreateParameterlessInstantiator(Type componentType, ConstructorInfo constructor)
        {
#if SILVERLIGHT
            var instantiatorMethod = new DynamicMethod("CreateInstance", componentType, null);
#else
            var instantiatorMethod = new DynamicMethod("CreateInstance", componentType, null, restrictedSkipVisibility: true);
#endif
            var generator = instantiatorMethod.GetILGenerator();

            // calling the contructor puts a reference to the new onject onto the stack
            generator.Emit(OpCodes.Newobj, constructor);
            // return newly created object reference
            generator.Emit(OpCodes.Ret);

            InstantiatorDelegate = (InstantiatorSignature)instantiatorMethod.CreateDelegate(typeof(InstantiatorSignature));
        }

#if !SILVERLIGHT
        private void CreateProxyInstantiator()
        {
            var constructor = ProxyType.GetConstructor(new Type[] { ServiceType, typeof(IBehavior[]) });

            var instantiatorMethod =
                new DynamicMethod("CreateProxyInstance",
                                  ProxyType,
                                  new Type[] { typeof(object), typeof(object[]) },
                                  typeof(ComponentInfo));
            {
                var generator = instantiatorMethod.GetILGenerator();

                generator.Emit(OpCodes.Ldarg_0);
                generator.Emit(OpCodes.Ldarg_1);
                // calling the contructor puts a reference to the new onject onto the stack
                generator.Emit(OpCodes.Newobj, constructor);
                // return newly created object reference
                generator.Emit(OpCodes.Ret);
            }

            ProxyInstantiatorDelegate = (ProxyInstantiatorSignature)instantiatorMethod.CreateDelegate(typeof(ProxyInstantiatorSignature));
        }
#endif

        private bool HasCustomAttribute<T>() where T : Attribute
        {
            if (ComponentType.GetCustomAttributes(typeof(T), false).Length > 0)
            {
                return true;
            }
            return false;
        }

        private object GetObjectInstance()
        {
            object instance;

            if (ComponentInstance != null)
            {
                instance = ComponentInstance;
            }
            else if (InstantiatorDelegate != null)
            {
                instance = InstantiatorDelegate();
            }
            else
            {
                var parameters = ConstructorParameters;
                var parameterValues = new object[parameters.Length];
                for (int index = 0; index < parameters.Length; index++)
                {
                    parameterValues[index] = Container.GetComponent(parameters[index].ParameterType);
                }
                instance = InstantiatorDelegateWithParams(parameterValues);
            }

            var locator = instance as ILocator;

            if (locator != null)
            {
                instance = locator.LocateComponent();
            }

            if (ProxyType != null)
            {
                instance = ProxyInstantiatorDelegate(instance, Behaviors);
            }
            return instance;
        }

#if !SILVERLIGHT
        private object GetPerWebRequestInstance()
        {
            if (HttpContext.Current.Items[ComponentKey] == null)
            {
                lock (HttpContext.Current.Items)
                {
                    if (HttpContext.Current.Items[ComponentKey] == null)
                    {
                        object instance = GetObjectInstance();
                        HttpContext.Current.Items[ComponentKey] = instance;
                        return instance;
                    }
                }
            }
            return HttpContext.Current.Items[ComponentKey];
        }
#endif

        private void RegenerateProxyWithSingletonInstance()
        {
            if (ProxyType != null)
            {
                if (singletonInstances.ContainsKey(ComponentType))
                {
                    var instance = singletonInstances[ComponentType];

                    instance = ProxyInstantiatorDelegate(instance, Behaviors);

                    lock (singletonLock)
                    {
                        singletonInstances[ComponentType] = instance;
                    }
                }
            }
        }

        private object GetSingletonInstance()
        {
            if (!singletonInstances.ContainsKey(ComponentType))
            {
                lock (singletonLock)
                {
                    if (!singletonInstances.ContainsKey(ComponentType))
                    {
                        object instance = GetObjectInstance();
                        singletonInstances.Add(ComponentType, instance);
                        return instance;
                    }
                }
            }
            return singletonInstances[ComponentType];
        }

        private object GetPerThreadInstance()
        {
            if (perThreadInstances == null)
            {
                perThreadInstances = new Dictionary<Type, object>();
            }
            if (!perThreadInstances.ContainsKey(ComponentType))
            {
                object instance = GetObjectInstance();
                perThreadInstances.Add(ComponentType, instance);
                return instance;
            }
            return perThreadInstances[ComponentType];
        }

        public object GetComponent()
        {
            Func<object> creator =
                () =>
                {
                    if (LifeCycleMode == LifeCycleMode.Singleton)
                    {
                        return GetSingletonInstance();
                    }
                    if (LifeCycleMode == LifeCycleMode.PerThread)
                    {
                        return GetPerThreadInstance();
                    }
#if !SILVERLIGHT
                    if ((LifeCycleMode == LifeCycleMode.PerWebRequest) && (HttpContext.Current != null))
                    {

                        return GetPerWebRequestInstance();
                    }
#endif
                    return GetObjectInstance();
                };

            Func<object> createDelegate = WrapCreateWithInterceptors(creator);
            return createDelegate();
        }

        private Func<object> WrapCreateWithInterceptors(Func<object> creator)
        {
            var call = creator;
            foreach (var creationInterceptor in ((IEnumerable<ICreationInterceptor>)CreationInterceptors).Reverse())
            {
                var interceptor = creationInterceptor;
                var downlineCall = call;
                call = () => interceptor.CreateInstance(downlineCall);
            }
            return call;
        }

        internal static void DisposeSingletons()
        {
            lock (singletonLock)
            {
                foreach (var singletonInstance in singletonInstances)
                {
                    var disposable = singletonInstance.Value as IDisposable;
                    if (disposable != null)
                    {
                        disposable.Dispose();
                    }
                }
                singletonInstances.Clear();
            }

            if (perThreadInstances != null)
            {
                // Best we can do for ThreadStatic singletons is to clear this thread's instances
                foreach (var perThreadInstance in perThreadInstances)
                {
                    var disposable = perThreadInstance.Value as IDisposable;
                    if (disposable != null)
                    {
                        disposable.Dispose();
                    }
                }
                perThreadInstances.Clear();
            }
        }

#if !SILVERLIGHT
        internal void SetServiceBehaviors(IBehavior[] behaviors)
        {
            if (ProxyType == null)
            {
                GenerateProxyType();
            }

            Behaviors = behaviors;

            if (LifeCycleMode == LifeCycleMode.Singleton)
            {
                RegenerateProxyWithSingletonInstance();
            }
        }

        private void GenerateProxyType()
        {
            if (ComponentType.GetInterfaces().Any(i => i.FullName == typeof(ILocator).FullName) == false)
            {
                ProxyType = DynamicProxyGenerator.CreateInterfaceProxy(ServiceType, ComponentType);
            }
            else
            {
                ProxyType = DynamicProxyGenerator.CreateInterfaceProxy(ServiceType, null);

            }
            CreateProxyInstantiator();
        }
#endif

        public void AddCreationInterceptor(ICreationInterceptor creationInterceptor)
        {
            CreationInterceptors.Add(creationInterceptor);
        }
    }
}
