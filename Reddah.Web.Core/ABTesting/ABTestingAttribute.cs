namespace Reddah.Web.Core.ABTesting
{
    using System;
    using System.Web.Mvc;

    using Reddah.Core.IoC;
    using Mvc.ActionFilters;

    /// <summary>
    /// Intercepts and bypass the current action and then invoke the targeted action according to the A/B testing parameters.
    /// A/B testing parameters do map audiences to features.
    /// Features are implemented as actions.
    /// </summary>
    /// <remarks>
    /// Known limitations:
    /// - Cannot apply the attribute to a controller. But we can get around this by doing a redirect in the targeted action.
    /// - Cannot bypass the OnActionExecuted and OnResultExecuted methods of the intercepted action.
    /// </remarks>
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class ABTestingAttribute : ActionFilterAttribute
    {
        private readonly Feature feature;
        private readonly string action;
        private readonly ABTestingFeatureManager pilotFeatureManager;

        public ABTestingAttribute(Feature feature, string action)
            : this(feature, action, IoC.Get<ABTestingFeatureManager>())
        {
        }

        public ABTestingAttribute(Feature feature, string action, ABTestingFeatureManager pilotFeatureManager)
        {
            if (string.IsNullOrWhiteSpace(action))
            {
                throw new ArgumentException("action");
            }

            this.feature = feature;
            this.action = action;
            this.pilotFeatureManager = pilotFeatureManager;
        }

        public bool IsActionIntercepted { get; private set; }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext == null)
            {
                throw new ArgumentNullException("filterContext");
            }

            filterContext.PreventChildActions();

            if (this.pilotFeatureManager.IsEnabled(this.feature) &&
                !string.Equals(this.action, filterContext.ActionDescriptor.ActionName, StringComparison.OrdinalIgnoreCase))
            {
                var controller = filterContext.Controller as Controller;

                if (controller != null)
                {
                    // Stop current action
                    filterContext.Result = new EmptyResult();

                    // Invoke the targeted action Note that the action parameter is case insensitive.
                    this.IsActionIntercepted = controller.ActionInvoker.InvokeAction(filterContext, this.action);

                    return;
                }
            }

            base.OnActionExecuting(filterContext);
        }
    }
}
