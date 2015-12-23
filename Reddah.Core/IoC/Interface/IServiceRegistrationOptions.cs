namespace Reddah.Core.IoC
{
    public interface IServiceRegistrationOptions<TService>
    {
        IServiceRegistrationOptions<TService> With<TBehavior>() where TBehavior : IBehavior, new();
        IServiceRegistrationOptions<TService> With<TBehavior>(string name) where TBehavior : IBehavior, new();

        IServiceRegistrationOptions<TService> WithLifeCycleMode(LifeCycleMode lifeCycleMode);
        IServiceRegistrationOptions<TService> WithLifeCycleMode(LifeCycleMode lifeCycleMode, string name);
    }
}
