namespace Reddah.Core.IoC
{
    using System.Collections.Generic;
    
    public class ServiceRegistrationOptions<TService> : IServiceRegistrationOptions<TService>
    {
        private readonly IContainer container;

        private List<IBehavior> AddedBehaviors { get; set; }

        public ServiceRegistrationOptions(IContainer container = null)
        {
            AddedBehaviors = new List<IBehavior>();
            this.container = container ?? Container.Instance;
        }

        public IServiceRegistrationOptions<TService> With<TBehavior>() where TBehavior : IBehavior, new()
        {
            AddedBehaviors.Add(new TBehavior());
            container.SetBehaviorsForService<TService>(AddedBehaviors.ToArray());

            return this;
        }

        public IServiceRegistrationOptions<TService> With<TBehavior>(string name) where TBehavior : IBehavior, new()
        {
            AddedBehaviors.Add(new TBehavior());
            container.SetBehaviorsForServiceByName<TService>(name, AddedBehaviors.ToArray());

            return this;
        }

        public IServiceRegistrationOptions<TService> WithLifeCycleMode(LifeCycleMode lifeCycleMode)
        {
            container.SetLifeCycleForService<TService>(lifeCycleMode);
            return this;
        }

        public IServiceRegistrationOptions<TService> WithLifeCycleMode(LifeCycleMode lifeCycleMode, string name)
        {
            container.SetLifeCycleForService<TService>(lifeCycleMode, name);
            return this;
        }
    }
}
