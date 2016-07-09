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
            
            routes.MapRoute(
                "DefaultCaptchaRoute", 
                "{locale}/DefaultCaptcha/Generate",
                new { controller = "DefaultCaptcha", action = "Generate" }
            );

            routes.MapRoute(
                "RefreshCaptchaRoute",
                "{locale}/DefaultCaptcha/Refresh",
                new { controller = "DefaultCaptcha", action = "Refresh" }
            );

            routes.MapLocalizedRoute(
                "Home",
                "{locale}",
                new { controller = "Support", action = "Index" }
            );

            routes.MapLocalizedRoute(
                "Submit",
                "{locale}/submit",
                new { controller = "submit", action = "index" }
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
                "JsonLogin",
                "{locale}/Account/JsonLogin",
                new { controller = "Account", action = "JsonLogin" }
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
                "ExternalLogin",
                "{locale}/Account/ExternalLogin",
                new { controller = "account", action = "ExternalLogin" }
            );

            routes.MapLocalizedRoute(
                "ExternalLoginFallback",
                "{locale}/Account/ExternalLoginCallback",
                new { controller = "account", action = "ExternalLoginCallback" }
            );

            routes.MapLocalizedRoute(
                "ExternalLoginFailure",
                "{locale}/Account/ExternalLoginFailure",
                new { controller = "account", action = "ExternalLoginFailure" }
            );

            routes.MapLocalizedRoute(
                "ExternalLoginConfirmation",
                "{locale}/Account/ExternalLoginConfirmation",
                new { controller = "account", action = "ExternalLoginConfirmation" }
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

            routes.MapLocalizedRoute(
                "Token",
                "{locale}/token",
                new { controller = "token", action = "index" }
            );

            routes.MapLocalizedRoute(
                "VerifyEmail",
                "{locale}/VerifyEmail",
                new { controller = "VerifyEmail", action = "index"}
            );

            routes.MapLocalizedRoute(
                "Log",
                "{locale}/log",
                new { controller = "log", action = "index" }
            );

            routes.MapLocalizedRoute(
                "QQ",
                "qq",
                new { controller = "QQ", action = "index" }
            );

            routes.MapLocalizedRoute(
                "UserCount",
                "{locale}/Users",
                new { controller = "UserCount", action = "index" }
            );

            routes.MapLocalizedRoute(
                "About",
                "{locale}/About",
                new { controller = "Support", action = "About" }
            );

            routes.MapLocalizedRoute(
                "Quote",
                "{locale}/Quote",
                new { controller = "Quote", action = "Index" }
            );
        }
    }
}