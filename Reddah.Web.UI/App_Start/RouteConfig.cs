namespace Reddah.Web.UI
{
    using System.Web.Mvc;
    using System.Web.Routing;
    using Reddah.Web.UI.Routing;

    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "SiteRootLocaleRedirect",
                "",
                new { },
                new { },
                new string[] { },
                u => new Route("", new RedirectToLocalizedHandler()));

            routes.MapLocalizedRoute(
                "Hot",
                "{locale}",
                new { controller = "Hot", action = "Index" }
            );

            //each has a route: hot/top/new/controversial/promoted

            routes.MapLocalizedRoute(
                "Support",
                "{locale}/support",
                new { controller = "Support", action = "Index" }
            );

            //routes.MapLocalizedRoute(
            //    "ArticleWithLocales",
            //    "{locale}/Articles/{*path}",
            //    new { controller = "Articles", action = "ClassicArticle" }
            //);

            routes.MapLocalizedRoute(
                "ArticleWithLocales",
                "{locale}/r/{*path}",
                new { controller = "Articles", action = "ClassicArticle" }
            );

            routes.MapLocalizedRoute(
                "ChangeLocale",
                "{locale}/ChangeLocale/{*path}",
                new { controller = "Home", action = "ChangeLocale" }
            );

            routes.MapLocalizedRoute(
                "Browse",
                "{locale}/Browse",
                new { controller = "BrowseNavigate", action = "BrowseNavigate" }
            );

            routes.MapLocalizedRoute(
                "BrowseGetPreviewsArticlesFragment",
                "{locale}/BrowseNavigate/GetPreviewsArticlesFragment",
                new { controller = "BrowseNavigate", action = "GetPreviewsArticlesFragment" }
                );

            routes.MapLocalizedRoute(
                "ContactSupportV2",
                "{locale}/Contact-us/{*path}",
                new { controller = "ContactSupport", action = "ContactSupportV2" }
                );

            routes.MapLocalizedRoute(
                "GetContactUsProductsWithCategories",
                "{locale}/ContactSupport/GetContactUsProductsWithCategories",
                new { controller = "ContactSupport", action = "GetContactUsProductsWithCategories" }
                );

            routes.MapLocalizedRoute(
                "GetWizardStepData",
                "{locale}/WizardStep/GetWizardStep",
                new { controller = "WizardStep", action = "GetWizardStep" }
                );

            routes.MapLocalizedRoute(
                "Login",
                "{locale}/account/login",
                new { controller = "account", action = "login" }
            );

            routes.MapLocalizedRoute(
                "Register",
                "{locale}/account/register",
                new { controller = "account", action = "register" }
            );

            routes.MapLocalizedRoute(
                "Manager",
                "{locale}/account/manage",
                new { controller = "account", action = "manage" }
            );

            routes.MapLocalizedRoute(
                "LogOff",
                "{locale}/account/logoff",
                new { controller = "account", action = "logoff" }
            );

            routes.MapLocalizedRoute(
                "testurl",
                "{locale}/testurl/{*path}",
                new { controller = "Articles", action = "ClassicArticle" }
            );

            routes.MapLocalizedRoute(
                "Error",
                "{locale}/Error",
                new { controller = "Home", action = "Error" }
            );
        }
    }
}