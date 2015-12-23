namespace Reddah.Core.IoC
{
    using System.Reflection;

    public interface IMethodInfoExpensiveEquality
    {
        bool AreEqual(MethodInfo targetMethod, MethodInfo sourceMethod);
    }
}
