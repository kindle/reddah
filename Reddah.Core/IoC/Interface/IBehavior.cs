namespace Reddah.Core.IoC
{
    using System;
    using System.Reflection;

    public interface IBehavior
    {
        void InvokeMethod(object component, Action nextCall, ProxiedCallInfo proxiedCallInfo);
    }

    public abstract class ProxiedCallInfo
    {
        public abstract object Component { get; }
        public abstract object ReturnValue { get; set; }
        public abstract object[] MethodAttributes { get; }
        public abstract object[] TypeAttributes { get; }
        public abstract MethodInfo SourceMethod { get; }
        public abstract MethodInfo TargetMethod { get; }
        public abstract ParameterInfo[] TargetMethodParameters { get; }

        public abstract object[] GetArguments();
    }
}
