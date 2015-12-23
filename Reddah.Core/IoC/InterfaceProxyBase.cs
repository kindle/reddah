namespace Reddah.Core.IoC
{
    using System;
    
    public class MethodInvokeResult
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1051:DoNotDeclareVisibleInstanceFields")]
        public object Result;
    }

    public class InterfaceProxyBase<TService>
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1051:DoNotDeclareVisibleInstanceFields")]
        protected TService Component;
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1051:DoNotDeclareVisibleInstanceFields")]
        protected IBehavior[] Behaviors;

        public InterfaceProxyBase(TService component, IBehavior[] behaviors)
        {
            Component = component;
            Behaviors = behaviors;
        }

        protected void WrapAndCall(Action call, ProxiedCallInfo callInfo)
        {
            Action wrappedCall = call;
            if (Behaviors != null && Behaviors.Length > 0)
            {
                wrappedCall = WrapACall(0, call, callInfo);
            }
            wrappedCall();
        }

        private Action WrapACall(int behaviorIndex, Action call, ProxiedCallInfo callInfo)
        {
            if (behaviorIndex == Behaviors.Length - 1)
            {
                return () => Behaviors[behaviorIndex].InvokeMethod(Component, call, callInfo);
            }
            return () => Behaviors[behaviorIndex].InvokeMethod(Component, WrapACall(behaviorIndex + 1, call, callInfo), callInfo);
        }
    }
}
