namespace Reddah.Web.UI
{
    using System.Web.Http;
    using System.Web.Mvc;
    using System.Web.Optimization;
    using System.Web.Routing;

    using Reddah.Core.IoC;
    using Reddah.Web.Core;
    using Reddah.Web.Core.ABTesting;
    using Reddah.Web.Live.ABTesting;

    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            //RegisterComponents();
            AreaRegistration.RegisterAllAreas();
            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            AuthConfig.RegisterAuth();
        }

        private static void RegisterComponents()
        {
            IoC.Register<IBrowserCapabilityProvider, BrowserCapabilityProvider>();
            IoC.Register<ABTestingFeatureManager, ABTestingFeatureManager>();
            IoC.Register<IABTestingParametersProvider, ABTestingParametersProvider>();
            IoC.Register<IFeatureAudienceMapper, FeatureAudienceMapper>();
            IoC.RegisterFactory<IAudienceManager>(() => new AudienceManager(IoC.Get<IBrowserCapabilityProvider>));
            IoC.Register<ITargetingTagResolverManager, TargetingTagResolverManager>();
            IoC.Register<IRequestPathProvider, HttpContextRequestPathProvider>();
            IoC.Register<IFeatureAudienceMapProvider, ABTestingFeatureAudienceMapProvider>();
            IoC.Register<ITagUsageCache, TagUsageCache>();
        }
    }
}