namespace Reddah.Core.IoC
{
    using System.Linq;
    using System.Reflection;

    public class MethodInfoExpensiveEquality : IMethodInfoExpensiveEquality
    {
        public bool AreEqual(MethodInfo targetMethod, MethodInfo sourceMethod)
        {
            return targetMethod.Name == sourceMethod.Name &&
                   targetMethod.ReturnType.FullName == sourceMethod.ReturnType.FullName &&
                   sourceMethod
                       .GetParameters()
                       .OrderBy(p => p.Position)
                       .IsEqualTo(targetMethod.GetParameters().OrderBy(p => p.Position),
                                  (sourceParameter, targetParameter) =>
                                      //sourceParameter.Name == targetParameter.Name &&
                                  sourceParameter.ParameterType.FullName ==
                                  targetParameter.ParameterType.FullName);

        }
    }
}
