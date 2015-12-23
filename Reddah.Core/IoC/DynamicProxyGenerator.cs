namespace Reddah.Core.IoC
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Linq;
    using System.Reflection;
    using System.Reflection.Emit;
    
    public static class DynamicProxyGenerator
    {
        /// <summary>
        /// Generates a new <see cref="System.Type"/> that implements an interface specified by the interfaceType parameter.
        /// <para>
        /// This function emits a new dynamic assembly, module and a set of classes. The main emitted class is the proxy around another object
        /// and implements the interface specified by the interfaceType parameter. 
        /// The proxy class derives from the <see cref="InterfaceProxyBase{TService}"/> class which stores references to the wrapped
        /// component in the <see cref="InterfaceProxyBase{TService}.Component"/> field and a list of behaviors to wrap the call with in
        /// the <see cref="InterfaceProxyBase{TService}.Behaviors"/> field.
        /// </para>
        /// </summary>
        /// <param name="interfaceType"> <see cref="System.Type"/> representing the interface to create a proxy for.</param>
        /// <param name="targetType"> <see cref="System.Type"/> representing the type of the intended proxy target.</param>
        /// <remarks>
        /// <para>
        /// The basic structure of each interface member is as follows:
        /// 
        /// <code>
        /// ...
        /// // for members that have void return type
        /// public void MemberName(parameters)
        /// {
        ///     var call = () => { Component.MemberName(parameters); };
        ///     WrapAndCall(call);
        /// }
        /// 
        /// // for members that return a value
        /// public T MemberName(parameters)
        /// {
        ///     var result = new MethodInvokeResult();
        ///     var call = () => { result.Result = Component.MemberName(parameters); };
        ///     WrapAndCall(call);
        ///     retrun reult.Result
        /// }
        /// ...
        /// </code>
        /// </para>
        /// </remarks>
        /// <returns></returns>
        public static Type CreateInterfaceProxy(Type interfaceType, Type targetType)
        {
            if (!interfaceType.IsInterface)
            {
                throw new ArgumentException("Creation of proxies is supported for Interface types only.", "interfaceType");
            }

            // the context is used to pass values around and to simplify the signatures for methods
            var context = new ProxyGenerationContext(interfaceType, targetType);

            InitializeProxyGenerationContext(interfaceType, context);

            // define dynamic assembly, module and the proxy type
            CreateProxyTypeBuilder(context);

            // the proxy class needs a contructor with 2 parameters (wrapped object and set of behaviors) that is a base
            // class constructor passthrough.
            DefineProxyConstructor(context);

            foreach (var memberInfo in GetMembersToProxy(interfaceType))
            {
                GenerateProxyMemberDefinition(context, memberInfo);
            }

            var type = context.typeBuilder.CreateType();

            return type;
        }

        public static Type CreateInterfaceProxy(Type interfaceType)
        {
            return CreateInterfaceProxy(interfaceType, null);
        }

        private static IEnumerable<MemberInfo> GetMembersToProxy(Type interfaceType)
        {
            var inheritedMembers = interfaceType.GetInterfaces().SelectMany(iface => iface.GetMembers());
            return interfaceType.GetMembers().Union(inheritedMembers).ToArray();
        }

        private static void InitializeProxyGenerationContext(Type interfaceType, ProxyGenerationContext context)
        {
            // build up the type of the proxy class' base class.
            // this is equivalent to typeof(InterfaceProxyBase<TService>)
            context.proxyBaseClass = typeof(InterfaceProxyBase<>).MakeGenericType(interfaceType);

            // store pointers to some well known fields/methods
            context.proxyBaseComponentField = context.proxyBaseClass.GetField("Component", BindingFlags.NonPublic | BindingFlags.Instance);
            context.proxyBaseWrapACallMethod = context.proxyBaseClass.GetMethod("WrapAndCall", BindingFlags.NonPublic | BindingFlags.Instance);
            context.methodInvokeResult_ResultField = typeof(MethodInvokeResult).GetField("Result",
                                                                                         BindingFlags.Public |
                                                                                         BindingFlags.Instance);
        }

        private static void GenerateProxyMemberDefinition(ProxyGenerationContext context, MemberInfo memberInfo)
        {
            switch (memberInfo.MemberType)
            {
                case MemberTypes.Method:
                    // Everything in an interface is really a method. Properties and events have get_/set_ and add_/remove_ accessors
                    // so most of the work is done here
                    GenerateMethodProxy(context, memberInfo);
                    break;

                case MemberTypes.Property:
                    var propertyInfo = (PropertyInfo)memberInfo;
                    context.typeBuilder.DefineProperty(propertyInfo.Name,
                                                       propertyInfo.Attributes,
                                                       propertyInfo.PropertyType,
                                                       propertyInfo.GetIndexParameters()
                                                           .Select(pi => pi.ParameterType)
                                                           .ToArray());
                    break;
                case MemberTypes.Event:
                    var eventInfo = (EventInfo)memberInfo;
                    context.typeBuilder.DefineEvent(eventInfo.Name,
                                                    eventInfo.Attributes,
                                                    eventInfo.EventHandlerType);
                    break;
                default:
                    throw new InvalidOperationException(string.Format(CultureInfo.InvariantCulture, "'{0}' member type is not yet supported.", memberInfo.MemberType));
            }
        }

        private static void GenerateMethodProxy(ProxyGenerationContext context, MemberInfo memberInfo)
        {
            // To completely understand how this works you will need some familiarity how lambda funtions and closures are implemented.
            // This essentially creates another class which is used to store all parameters passed into the method as well as the result.
            // The effect of closure is achieved by instantiating this class and using it's fields to pass around
            // the variables used in a lambda expressions. Basic structure of an enclosure class is as follows:
            //
            // public sealed closure_for_#MemberName#_#GUID1#
            // {
            //      public TService Component_#GUID2#;
            //      public MethodInvokeResult Result_#GUID3#;
            //      public TParam1 param1;
            //      public TParam2 param2;
            //      ...
            //      public void #MemberName#_#GUID4#()
            //      {
            //          Result_#GUID3#.Result = Component_#GUID2#.#MemberName#(param1, param2, ...);
            //      }
            //  }
            //
            // The Result is only emitted and is only used if the wrapped method is not void

            var methodInfo = (MethodInfo)memberInfo;
            var parameterInfos = methodInfo.GetParameters();

            var closureFields = new Dictionary<ParameterInfo, FieldInfo>();

            // define the closure class
            GenerateClosureType(methodInfo, context, parameterInfos, closureFields);

            // if the method was generic, then the closure class is generic as well. 
            // we then need to update all calls into the closure class to use the method's generic parameters.
            if (methodInfo.IsGenericMethod)
            {
                closureFields = UpdateClosureReferencesForGenericMethod(methodInfo, context, closureFields);
            }

            // define method
            MethodBuilder methodBuilder = GenerateWrapperMethodIL(methodInfo, context, parameterInfos, closureFields);
            context.typeBuilder.DefineMethodOverride(methodBuilder, methodInfo);
        }

        private static void GenerateClosureType(MethodInfo methodInfo, ProxyGenerationContext context, ParameterInfo[] parameterInfos, Dictionary<ParameterInfo, FieldInfo> closureFields)
        {
            MatchToTargetMethodIfNecessary(methodInfo, context);

            var id = GetGuidBasedId();
            var closureDataClassName = "ClosureData_for_" + methodInfo.Name + "_" + id;
            var closureClassName = "Closure_for_" + methodInfo.Name + "_" + id;

            Type closureDataClassType = GenerateClosureDataType(context, closureDataClassName);

            SetClosureDataClassValues(methodInfo, context, closureDataClassType);

            var closureClassBuilder =
                context.dynamicModule.DefineType(
                    closureClassName,
                    TypeAttributes.Sealed | TypeAttributes.Public,
                    typeof(ProxiedCallInfo));
            {
                GenericTypeParameterBuilder[] nestedGenericParameterTypes = null;
                if (methodInfo.IsGenericMethod)
                {
                    nestedGenericParameterTypes = CloneGenericParameters(methodInfo, "P_", closureClassBuilder.DefineGenericParameters);
                }

                // gotta have a default constructor
                context.nestedConstructor = closureClassBuilder.DefineDefaultConstructor(MethodAttributes.Public);
                // create a filed to store the refernece to the proxied component
                context.nestedComponentField = closureClassBuilder.DefineField("Component_" + GetGuidBasedId(),
                                                                               context.interfaceType,
                                                                               FieldAttributes.Public);
                // create a field for each parameter to the proxied function
                var parameterNumber = 0;
                foreach (var parameterInfo in parameterInfos)
                {
                    var parameterType = parameterInfo.ParameterType;
                    if (methodInfo.IsGenericMethod && parameterType.IsGenericParameter)
                    {
                        var type = parameterType;
                        parameterType =
                            nestedGenericParameterTypes.Where(gpt => gpt.Name == "P_" + type.Name).First();
                    }
                    FieldBuilder closureField;

                    if (parameterType.IsByRef)
                    {
                        closureField = closureClassBuilder.DefineField("parameter_" + parameterNumber,
                                                                       parameterType.GetElementType(),
                                                                       FieldAttributes.Public);
                    }
                    else
                    {
                        closureField = closureClassBuilder.DefineField("parameter_" + parameterNumber,
                                                                       parameterType,
                                                                       FieldAttributes.Public);
                    }
                    closureFields.Add(parameterInfo, closureField);

                    parameterNumber++;
                }

                // create a field to store the MethodInvokeResult
                context.nestedResultField = closureClassBuilder.DefineField("Result_" + GetGuidBasedId(),
                                                                            typeof(MethodInvokeResult),
                                                                            FieldAttributes.Public);

                // create the method to call the proxied method on the Component
                CreateProxyCallToComponentMethod(methodInfo, context, closureClassBuilder, parameterInfos, nestedGenericParameterTypes, closureFields);

                // implement GetArguments() from base abstract ProxiedCallInfo
                ImplementGetArgumentsMethod(methodInfo, closureClassBuilder, parameterInfos, nestedGenericParameterTypes, closureFields);

                ImplementAbstractMembersFromBaseClass(context, closureClassBuilder);
            }
            context.closureType = closureClassBuilder.CreateType();
        }

        private static void ImplementAbstractMembersFromBaseClass(ProxyGenerationContext context, TypeBuilder closureClassBuilder)
        {
            // implement get_Component from base abstract ProxiedCallInfo
            ImplementComponentProperty(context, closureClassBuilder);

            // implement get_ReturnValue from base abstract ProxiedCallInfo
            ImplementReturnValueProperty(context, closureClassBuilder);

            // implement GetTargetAttributes() from base abstract ProxiedCallInfo
            ImplementClosureDataAccessorField(closureClassBuilder, "get_MethodAttributes", typeof(object[]), context.targetAttributesField);

            // implement GetTargetAttributes() from base abstract ProxiedCallInfo
            ImplementClosureDataAccessorField(closureClassBuilder, "get_TypeAttributes", typeof(object[]), context.targetTypeAttributesField);

            // implement get_SourceMethod from base abstract ProxiedCallInfo
            ImplementClosureDataAccessorField(closureClassBuilder, "get_SourceMethod", typeof(MethodInfo), context.sourceMethodField);

            // implement get_TargetMethod from base abstract ProxiedCallInfo
            ImplementClosureDataAccessorField(closureClassBuilder, "get_TargetMethod", typeof(MethodInfo), context.targetMethodField);

            // implement get_TargetMethodParameters from base abstract ProxiedCallInfo
            ImplementClosureDataAccessorField(closureClassBuilder, "get_TargetMethodParameters", typeof(ParameterInfo[]), context.targetMethodParametersField);
        }

        private static void SetClosureDataClassValues(MethodInfo methodInfo, ProxyGenerationContext context, Type closureDataClassType)
        {
            closureDataClassType.GetField("targetAttributes").SetValue(null, GetTargetMethodAttributes(context, methodInfo));
            closureDataClassType.GetField("targetTypeAttributes").SetValue(null, GetTargetTypeAttributes(context));
            closureDataClassType.GetField("sourceMethod").SetValue(null, methodInfo);
            closureDataClassType.GetField("targetMethod").SetValue(null, context.targetMethod);
            if (context.targetMethod != null)
            {
                closureDataClassType
                    .GetField("targetMethodParameters")
                    .SetValue(null, context.targetMethod.GetParameters());
            }
        }

        private static Type GenerateClosureDataType(ProxyGenerationContext context, string closureDataClassName)
        {
            var closureDataClassBuilder =
                context.dynamicModule.DefineType(
                    closureDataClassName,
                    TypeAttributes.Sealed | TypeAttributes.Public,
                    typeof(object));
            {
                context.targetAttributesField =
                    closureDataClassBuilder.DefineField("targetAttributes",
                                                        typeof(object[]),
                                                        FieldAttributes.Static | FieldAttributes.Public);

                context.targetTypeAttributesField =
                    closureDataClassBuilder.DefineField("targetTypeAttributes",
                                                        typeof(object[]),
                                                        FieldAttributes.Static | FieldAttributes.Public);

                context.sourceMethodField =
                    closureDataClassBuilder.DefineField("sourceMethod",
                                                        typeof(MethodInfo),
                                                        FieldAttributes.Static | FieldAttributes.Public);

                context.targetMethodField =
                    closureDataClassBuilder.DefineField("targetMethod",
                                                        typeof(MethodInfo),
                                                        FieldAttributes.Static | FieldAttributes.Public);

                context.targetMethodParametersField =
                    closureDataClassBuilder.DefineField("targetMethodParameters",
                                                        typeof(ParameterInfo[]),
                                                        FieldAttributes.Static | FieldAttributes.Public);
            }

            return closureDataClassBuilder.CreateType();
        }

        private static void MatchToTargetMethodIfNecessary(MethodInfo methodInfo, ProxyGenerationContext context)
        {
            if (context.targetType == null)
            {
                context.targetMethod = null;
            }
            else
            {
                context.targetMethod = MatchMethodOnTargetType(context.interfaceType, context.targetType, methodInfo);
            }
        }

        private static MethodInfo MatchMethodOnTargetType(Type sourceType, Type targetType, MethodInfo methodInfo)
        {
            var members =
                targetType.GetMembers();

            var matchingMethods = members.OfType<MethodInfo>().Where(m => DoMethodSignaturesMatch(m, methodInfo));

            if (matchingMethods.Count() == 0)
            {
                throw new ArgumentException(
                    String.Format(
                        "Error matching a method on target for '{0}'->'{1}'. No target method on '{2}' matched the source method. This most likely indicates a deficiency in the Dynamic Proxy method matching logic.",
                        sourceType.FullName, methodInfo.Name, targetType.FullName));
            }

            if (matchingMethods.Count() > 1)
            {
                throw new ArgumentException(
                    String.Format(
                        "Error matching a method on target for '{0}'->'{1}'. More than one target method on '{2}' matched the source method. This most likely indicates a deficiency in the Dynamic Proxy method matching logic.",
                        sourceType.FullName, methodInfo.Name, targetType.FullName));
            }

            return matchingMethods.First();
        }

        private static void ImplementClosureDataAccessorField(TypeBuilder closureClassBuilder, string methodName, Type returnType, FieldBuilder field)
        {
            var getTargetAttributesMethod =
                closureClassBuilder.DefineMethod(methodName,
                                                 MethodAttributes.Public | MethodAttributes.Virtual | MethodAttributes.Final,
                                                 returnType,
                                                 Type.EmptyTypes);
            {
                var generator = getTargetAttributesMethod.GetILGenerator();

                generator.Emit(OpCodes.Ldsfld, field);
                generator.Emit(OpCodes.Ret);
            }
        }

        private static object[] GetTargetMethodAttributes(ProxyGenerationContext context, MethodInfo methodInfo)
        {
            var targetMethodattributes = new object[0];
            var sourceMethodattributes = methodInfo.GetCustomAttributes(true);

            if (context.targetType != null)
            {
                try
                {
                    targetMethodattributes = context.targetMethod.GetCustomAttributes(true);
                }
                catch { } // Suppress exceptions from invalid target attributes (e.g. when proxying mocked/dynamic objects)
            }

            return sourceMethodattributes.Union(targetMethodattributes).ToArray();
        }

        private static object[] GetTargetTypeAttributes(ProxyGenerationContext context)
        {
            var targetTypeAttributes = new object[0];
            var sourceTypeAttributes = context.interfaceType.GetCustomAttributes(true);

            if (context.targetType != null)
            {
                try
                {
                    targetTypeAttributes = context.targetType.GetCustomAttributes(true);
                }
                catch { } // Suppress exceptions from invalid target attributes (e.g. when proxying mocked/dynamic objects)
            }

            return sourceTypeAttributes.Union(targetTypeAttributes).ToArray();
        }

        private static readonly MethodInfoExpensiveEquality MethodInfoEquality = new MethodInfoExpensiveEquality();

        private static bool DoMethodSignaturesMatch(MethodInfo targetMethod, MethodInfo sourceMethod)
        {
            return MethodInfoEquality.AreEqual(targetMethod, sourceMethod);
        }

        public static bool IsEqualTo<TSource>(this IEnumerable<TSource> source, IEnumerable<TSource> target, Func<TSource, TSource, bool> comparer)
        {
            var sourceArray = source.ToArray();
            var targetArray = target.ToArray();

            if (sourceArray.Length != targetArray.Length)
            {
                return false;
            }

            for (int position = 0; position < sourceArray.Length; position++)
            {
                if (!comparer(sourceArray[position], targetArray[position]))
                {
                    return false;
                }
            }

            return true;
        }

        private static void CreateProxyCallToComponentMethod(MethodInfo methodInfo, ProxyGenerationContext context, TypeBuilder closureClassBuilder, ParameterInfo[] parameterInfos, GenericTypeParameterBuilder[] nestedGenericParameterTypes, Dictionary<ParameterInfo, FieldInfo> closureFields)
        {
            context.nestedCallToProxiedComponent =
                closureClassBuilder.DefineMethod(methodInfo.Name + "_" + GetGuidBasedId(),
                                                 MethodAttributes.Public,
                                                 typeof(void),
                                                 Type.EmptyTypes);
            {
                var nestedCallGenerator = (context.nestedCallToProxiedComponent as MethodBuilder).GetILGenerator();

                if (methodInfo.ReturnType != typeof(void))
                {
                    // put the MethodInvokeResult instance from the Result field on the stack. 
                    // This is needed later to store the result value in there.
                    nestedCallGenerator.Emit(OpCodes.Ldarg_0);
                    nestedCallGenerator.Emit(OpCodes.Ldfld, context.nestedResultField);
                }
                // put the Component on the stack so we can make a call on it
                nestedCallGenerator.Emit(OpCodes.Ldarg_0);
                nestedCallGenerator.Emit(OpCodes.Ldfld, context.nestedComponentField);
                // put all arguments onto the stack to prepare for the call
                foreach (var parameterInfo in parameterInfos)
                {
                    nestedCallGenerator.Emit(OpCodes.Ldarg_0);

                    if (parameterInfo.ParameterType.IsByRef)
                    {
                        nestedCallGenerator.Emit(OpCodes.Ldflda, closureFields[parameterInfo]);
                    }
                    else
                    {
                        nestedCallGenerator.Emit(OpCodes.Ldfld, closureFields[parameterInfo]);
                    }
                }
                // call the proxied call
                if (methodInfo.IsGenericMethod)
                {
                    var nestedGenericCall = methodInfo.MakeGenericMethod(nestedGenericParameterTypes);
                    nestedCallGenerator.Emit(OpCodes.Callvirt, nestedGenericCall);
                }
                else
                {
                    nestedCallGenerator.Emit(OpCodes.Callvirt, methodInfo);
                }

                if (methodInfo.ReturnType != typeof(void))
                {
                    // now store result of last call into Result field of MethodInvokeResult instance that was put on the stack before
                    if (methodInfo.ReturnType.IsValueType)
                    {
                        nestedCallGenerator.Emit(OpCodes.Box, methodInfo.ReturnType);
                    }
                    nestedCallGenerator.Emit(OpCodes.Stfld,
                                             context.methodInvokeResult_ResultField);
                }
                // and return
                nestedCallGenerator.Emit(OpCodes.Ret);
            }
        }

        private static void ImplementGetArgumentsMethod(MethodInfo methodInfo, TypeBuilder closureClassBuilder, ParameterInfo[] parameterInfos, GenericTypeParameterBuilder[] nestedGenericParameterTypes, Dictionary<ParameterInfo, FieldInfo> closureFields)
        {
            var getArgumentsMethod =
                closureClassBuilder.DefineMethod("GetArguments",
                                                 MethodAttributes.Public | MethodAttributes.Virtual | MethodAttributes.Final,
                                                 typeof(object[]),
                                                 Type.EmptyTypes);
            {
                var nestedCallGenerator = getArgumentsMethod.GetILGenerator();

                nestedCallGenerator.DeclareLocal(typeof(object[]));
                nestedCallGenerator.LoadInt32Constant(parameterInfos.Length);
                nestedCallGenerator.Emit(OpCodes.Newarr, typeof(object));
                nestedCallGenerator.Emit(OpCodes.Stloc_0);

                var parameterNumber = 0;
                foreach (var parameterInfo in parameterInfos)
                {
                    nestedCallGenerator.Emit(OpCodes.Ldloc_0);
                    nestedCallGenerator.LoadInt32Constant(parameterNumber);
                    nestedCallGenerator.Emit(OpCodes.Ldarg_0);
                    nestedCallGenerator.Emit(OpCodes.Ldfld, closureFields[parameterInfo]);

                    if (parameterInfo.ParameterType.IsValueType)
                    {
                        nestedCallGenerator.Emit(OpCodes.Box, parameterInfo.ParameterType);
                    }
                    else if (parameterInfo.ParameterType.IsByRef)
                    {
                        if (parameterInfo.ParameterType.GetElementType().IsValueType)
                        {
                            nestedCallGenerator.Emit(OpCodes.Box, parameterInfo.ParameterType.GetElementType());
                        }
                    }
                    else if (methodInfo.IsGenericMethod && parameterInfo.ParameterType.IsGenericParameter)
                    {
                        var parameterType =
                            nestedGenericParameterTypes.First(gpt => gpt.Name == "P_" + parameterInfo.ParameterType.Name);
                        nestedCallGenerator.Emit(OpCodes.Box, parameterType);
                    }

                    nestedCallGenerator.Emit(OpCodes.Stelem_Ref);

                    parameterNumber++;
                }

                nestedCallGenerator.Emit(OpCodes.Ldloc_0);

                nestedCallGenerator.Emit(OpCodes.Ret);
            }
        }

        private static void ImplementReturnValueProperty(ProxyGenerationContext context, TypeBuilder closureClassBuilder)
        {
            var getReturnValueMethod =
                closureClassBuilder.DefineMethod("get_ReturnValue",
                                                 MethodAttributes.Public | MethodAttributes.Virtual | MethodAttributes.Final,
                                                 typeof(object),
                                                 Type.EmptyTypes);
            {
                var nestedCallGenerator = getReturnValueMethod.GetILGenerator();

                // return this.Result_#GUID#.Result;

                nestedCallGenerator.DeclareLocal(typeof(object));

                // put the MethodInvokeResult instance from the Result field on the stack. 
                nestedCallGenerator.Emit(OpCodes.Ldarg_0);                                        // this
                nestedCallGenerator.Emit(OpCodes.Ldfld, context.nestedResultField);               // .Result_#GUID#
                nestedCallGenerator.Emit(OpCodes.Ldfld, context.methodInvokeResult_ResultField);  // .Result_#GUID#

                nestedCallGenerator.Emit(OpCodes.Ret);
            }
            var setReturnValueMethod =
                closureClassBuilder.DefineMethod("set_ReturnValue",
                                                 MethodAttributes.Public | MethodAttributes.Virtual |
                                                 MethodAttributes.Final,
                                                 typeof(void),
                                                 new Type[] { typeof(object) });
            {
                var nestedCallGenerator = setReturnValueMethod.GetILGenerator();

                // this.Result_#GUID#.Result = value;

                nestedCallGenerator.Emit(OpCodes.Ldarg_0);                                        // this
                nestedCallGenerator.Emit(OpCodes.Ldfld, context.nestedResultField);               // .Result_#GUID#
                nestedCallGenerator.Emit(OpCodes.Ldarg_1); // value
                nestedCallGenerator.Emit(OpCodes.Stfld, context.methodInvokeResult_ResultField);  // .Result_#GUID#

                nestedCallGenerator.Emit(OpCodes.Ret);
            }
        }

        private static void ImplementComponentProperty(ProxyGenerationContext context, TypeBuilder closureClassBuilder)
        {
            var getComponentMethod =
                closureClassBuilder.DefineMethod("get_Component",
                                                 MethodAttributes.Public | MethodAttributes.Virtual | MethodAttributes.Final,
                                                 typeof(object),
                                                 Type.EmptyTypes);
            {
                var nestedCallGenerator = getComponentMethod.GetILGenerator();

                // return this.Component;
                nestedCallGenerator.Emit(OpCodes.Ldarg_0);                              // this
                nestedCallGenerator.Emit(OpCodes.Ldfld, context.nestedComponentField);  // .Component_#GUID#

                nestedCallGenerator.Emit(OpCodes.Ret);
            }
        }

        private static GenericTypeParameterBuilder[] CloneGenericParameters(MethodInfo methodInfo, string prefix, Func<string[], GenericTypeParameterBuilder[]> lambdaDefineGenericParameters)
        {
            var methodGenericArguments = methodInfo.GetGenericArguments();
            var genericParameterNames =
                methodGenericArguments.Select(gpt => prefix + gpt.Name).ToArray();
            var genericParameterTypes = lambdaDefineGenericParameters(genericParameterNames);

            return genericParameterTypes;
        }

        private static MethodBuilder GenerateWrapperMethodIL(MethodInfo methodInfo, ProxyGenerationContext context, ParameterInfo[] parameterInfos, Dictionary<ParameterInfo, FieldInfo> closureFields)
        {
            var methodBuilder =
                context.typeBuilder.DefineMethod(
                    methodInfo.Name,
                    methodInfo.Attributes & ~MethodAttributes.Abstract, // original attributes but drop Abstract (original AND NOT Abstract)
                    methodInfo.ReturnType,
                    parameterInfos
                        .Select(parameterInfo => parameterInfo.ParameterType)
                        .ToArray());
            {
                if (methodInfo.IsGenericMethod)
                {
                    CloneGenericParameters(methodInfo, "I_", methodBuilder.DefineGenericParameters);
                }

                var generator = methodBuilder.GetILGenerator();

                // declare locals
                generator.DeclareLocal(typeof(Action)); // [0] Action call
                generator.DeclareLocal(typeof(Action)); // [1] Action wrappedCall
                generator.DeclareLocal(context.closureType); // [2] TClosure closure
                generator.DeclareLocal(typeof(MethodInvokeResult)); // [3] MethodInvokeResult result

                // create result class                                  result = new MethodInvokeResult();

                generator.Emit(OpCodes.Newobj, typeof(MethodInvokeResult).GetConstructors()[0]);
                generator.Emit(OpCodes.Stloc_3);

                // create the closure class and populate its fields     closure = new TClosure();

                generator.Emit(OpCodes.Newobj, context.nestedConstructor); // new nested_closure_class();
                generator.Emit(OpCodes.Stloc_2); // closure = <result from above>

                // set Component to point at proxy class' Component 
                // field as inherited from ProxyBase                    closure.Component_#GUID# = this.Component;
                generator.Emit(OpCodes.Ldloc_2); // closure
                generator.Emit(OpCodes.Ldarg_0); // { this
                generator.Emit(OpCodes.Ldfld, context.proxyBaseComponentField); //      .Component }
                generator.Emit(OpCodes.Stfld, context.nestedComponentField);
                // .Component_##### = <result from above>

                // map arguments to input fields                        closure.argumentN = argumentN
                var argumentCounter = 1;
                foreach (var parameterInfo in parameterInfos)
                {
                    if (parameterInfo.ParameterType.IsByRef)
                    {

                        generator.Emit(OpCodes.Ldloc_2); // put reference to closure on the stack
                        generator.Emit(OpCodes.Ldarg, argumentCounter); // put next ref argument on the stack

                        EmitLoadIndirectOpCodeForType(generator, parameterInfo);

                        generator.Emit(OpCodes.Stfld, closureFields[parameterInfo]); // set closure field to value

                    }
                    else
                    {
                        generator.Emit(OpCodes.Ldloc_2); // put reference to closure on the stack
                        generator.Emit(OpCodes.Ldarg, argumentCounter); // put next argument on the stack
                        generator.Emit(OpCodes.Stfld, closureFields[parameterInfo]); // set closure field to value
                    }

                    argumentCounter++;
                }

                // set result field to point at our result local        closure.result = result;
                generator.Emit(OpCodes.Ldloc_2); // closure
                generator.Emit(OpCodes.Ldloc_3); // reult
                generator.Emit(OpCodes.Stfld, context.nestedResultField); // closure.Result = result

                // create a delegate for nested call                    call = new Action(closure.nestedCallToProxiedComponent);
                // put closure on the stack
                generator.Emit(OpCodes.Ldloc_2);
                // put the pointer to the proxy method on stack
                generator.Emit(OpCodes.Ldftn, context.nestedCallToProxiedComponent);
                // create an Action pointing at that method
                generator.Emit(OpCodes.Newobj,
                               typeof(Action).GetConstructor(new Type[] { typeof(object), typeof(IntPtr) }));
                // store the action in local variable
                generator.Emit(OpCodes.Stloc_0);

                // call WrapAndCall                                     WrapAndCall(call, closure);
                // put 'this' pointer on the stack
                generator.Emit(OpCodes.Ldarg_0);
                // put 'call' local variable on  the stack
                generator.Emit(OpCodes.Ldloc_0);
                // put 'closure' on the stack
                generator.Emit(OpCodes.Ldloc_2);
                // call into 'WrapAndCall' which is inherited form the base class
                generator.Emit(OpCodes.Callvirt, context.proxyBaseWrapACallMethod);

                argumentCounter = 1;
                foreach (var parameterInfo in parameterInfos)
                {
                    //If parameter is by ref, reassign the closure field after the method was called
                    if (parameterInfo.ParameterType.IsByRef)
                    {
                        generator.Emit(OpCodes.Ldarg, argumentCounter);
                        generator.Emit(OpCodes.Ldloc_2);
                        generator.Emit(OpCodes.Ldfld, closureFields[parameterInfo]);
                        EmitSetIndirectOpCodeForType(generator, parameterInfo); //The parameter needs to be indirectly assigned since it's the reference we want to update and not the value
                    }

                    argumentCounter++;
                }

                if (methodInfo.ReturnType != typeof(void))
                {
                    // if method is not void                            return result.Result;
                    generator.Emit(OpCodes.Ldloc_3);
                    generator.Emit(OpCodes.Ldfld, context.methodInvokeResult_ResultField);
                    if (methodInfo.ReturnType.IsValueType)
                    {
                        generator.Emit(OpCodes.Unbox_Any, methodInfo.ReturnType);
                    }
                }

                generator.Emit(OpCodes.Ret);
            }
            return methodBuilder;
        }

        private static void EmitSetIndirectOpCodeForType(ILGenerator generator, ParameterInfo parameterInfo)
        {
            Type elementType = parameterInfo.ParameterType.GetElementType();
            if (!elementType.IsValueType)
            {
                generator.Emit(OpCodes.Stind_Ref);
            }
            else if (elementType == typeof(Int32) || elementType == typeof(UInt32))
            {
                generator.Emit(OpCodes.Stind_I4);
            }
            else if (elementType == typeof(Int64) || elementType == typeof(UInt64))
            {
                generator.Emit(OpCodes.Stind_I8);
            }
            else if (elementType == typeof(Int16) || elementType == typeof(UInt16))
            {
                generator.Emit(OpCodes.Stind_I2);
            }
            else
            {
                throw new NotImplementedException("The dynamic proxy generation does not currenlty work with methods that have ref and out parameters on the type specified: " + elementType);
            }
        }

        private static void EmitLoadIndirectOpCodeForType(ILGenerator generator, ParameterInfo parameterInfo)
        {
            Type elementType = parameterInfo.ParameterType.GetElementType();
            if (!elementType.IsValueType)
            {
                generator.Emit(OpCodes.Ldind_Ref);
            }
            else if (elementType == typeof(Int32) || elementType == typeof(UInt32))
            {
                generator.Emit(OpCodes.Ldind_I4);
            }
            else if (elementType == typeof(Int64) || elementType == typeof(UInt64))
            {
                generator.Emit(OpCodes.Ldind_I8);
            }
            else if (elementType == typeof(Int16) || elementType == typeof(UInt16))
            {
                generator.Emit(OpCodes.Ldind_I2);
            }
            else
            {
                throw new NotImplementedException("The dynamic proxy generation does not currenlty work with methods that have ref and out parameters on the type specified: " + elementType);
            }
        }

        private static Dictionary<ParameterInfo, FieldInfo> UpdateClosureReferencesForGenericMethod(MethodInfo methodInfo, ProxyGenerationContext context, Dictionary<ParameterInfo, FieldInfo> closureFields)
        {
            context.closureType = context.closureType.MakeGenericType(methodInfo.GetGenericArguments());

            context.nestedConstructor = context.closureType.GetConstructors()[0];
            context.nestedCallToProxiedComponent = context.closureType.GetMethod(context.nestedCallToProxiedComponent.Name);
            context.nestedComponentField = context.closureType.GetField(context.nestedComponentField.Name);
            var closureGenericFields = new Dictionary<ParameterInfo, FieldInfo>();
            foreach (var closureField in closureFields)
            {
                closureGenericFields.Add(closureField.Key, context.closureType.GetField(closureField.Value.Name));
            }
            closureFields = closureGenericFields;
            context.nestedResultField = context.closureType.GetField(context.nestedResultField.Name);
            return closureFields;
        }

        private static string GetGuidBasedId()
        {
            return Guid.NewGuid().ToString("N");
        }

        private static void CreateProxyTypeBuilder(ProxyGenerationContext context)
        {
            context.assemblyName = "proxyAssembly_" + context.interfaceType.Name + "_" + GetGuidBasedId();
            context.moduleName = "proxyModule_" + context.interfaceType.Name + "_" + GetGuidBasedId();
            context.typeName = "proxy_" + context.interfaceType.Name + "_" + GetGuidBasedId();

            var appDomain = AppDomain.CurrentDomain;
            context.dynamicAssembly = appDomain.DefineDynamicAssembly(new AssemblyName(context.assemblyName), AssemblyBuilderAccess.RunAndSave);
            context.dynamicModule = context.dynamicAssembly.DefineDynamicModule(context.moduleName, context.moduleName + ".dll");


            context.typeBuilder =
                context.dynamicModule.DefineType(
                    context.typeName,
                    TypeAttributes.Public,
                    context.proxyBaseClass);

            context.typeBuilder.AddInterfaceImplementation(context.interfaceType);
        }

        private static void DefineProxyConstructor(ProxyGenerationContext context)
        {
            var baseConstructor = context.proxyBaseClass.GetConstructors()[0];

            context.constructorBuilder =
                context.typeBuilder.DefineConstructor(
                    MethodAttributes.Public,
                    CallingConventions.Standard,
                    new Type[]
                        {
                            context.interfaceType, typeof (IBehavior[])
                        });
            {
                var constructorILGenerator = context.constructorBuilder.GetILGenerator();

                constructorILGenerator.Emit(OpCodes.Ldarg_0);
                constructorILGenerator.Emit(OpCodes.Ldarg_1);
                constructorILGenerator.Emit(OpCodes.Ldarg_2);
                constructorILGenerator.Emit(OpCodes.Call, baseConstructor);
                constructorILGenerator.Emit(OpCodes.Ret);
            }
        }

        private class ProxyGenerationContext
        {
            public Type interfaceType;
            public Type targetType;
            public Type proxyBaseClass;
            public FieldInfo proxyBaseComponentField;
            public MethodInfo proxyBaseWrapACallMethod;
            public TypeBuilder typeBuilder;
            public string assemblyName;
            public string moduleName;
            public string typeName;
            public AssemblyBuilder dynamicAssembly;
            public ModuleBuilder dynamicModule;
            public ConstructorBuilder constructorBuilder;
            public FieldInfo methodInvokeResult_ResultField;
            public Type closureType;
            public ConstructorInfo nestedConstructor;
            public FieldInfo nestedComponentField;
            public MethodInfo nestedCallToProxiedComponent;
            public FieldInfo nestedResultField;
            public FieldBuilder targetAttributesField;
            public FieldBuilder targetTypeAttributesField;
            public FieldBuilder sourceMethodField;
            public MethodInfo targetMethod;
            public FieldBuilder targetMethodField;
            public FieldBuilder targetMethodParametersField;

            public ProxyGenerationContext(Type interfaceType, Type targetType)
            {
                this.interfaceType = interfaceType;
                this.targetType = targetType;
            }
        }
    }
}
