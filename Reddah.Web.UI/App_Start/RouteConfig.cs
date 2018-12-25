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

            //menu default
            routes.MapLocalizedRoute(
               "Home", "{locale}",
               new { controller = "AI", action = "UserProfile", menu = "promoted" }
            );
            routes.MapLocalizedRoute("New", "{locale}/new",
                new { controller = "AI", action = "UserProfile", menu = "new" }
            );
            routes.MapLocalizedRoute("Promoted", "{locale}/promoted",
                new { controller = "AI", action = "UserProfile", menu = "promoted" }
            );
            routes.MapLocalizedRoute("Hot", "{locale}/hot",
                new { controller = "AI", action = "UserProfile", path = "hot" }
            );


            routes.MapLocalizedRoute("Gilded", "{locale}/gilded",
                new { controller = "Articles", action = "Menu", path = "gilded" }
            );
            routes.MapLocalizedRoute("Rising", "{locale}/rising",
                new { controller = "Articles", action = "Menu", path = "rising" }
            );
            routes.MapLocalizedRoute("Controversial", "{locale}/controversial",
                new { controller = "Articles", action = "Menu", path = "controversial" }
            );
            routes.MapLocalizedRoute("Top", "{locale}/top",
                new { controller = "Articles", action = "Menu", path = "top" }
            );
            routes.MapLocalizedRoute("Support", "{locale}/support",
                new { controller = "Support", action = "Index" }
            );


            //articles JSON
            routes.MapLocalizedRoute(
                "JsonUserProfileArticles", "{locale}/AI/JsonUserProfileArticles",
                new { controller = "AI", action = "JsonUserProfileArticles" }
            );
            routes.MapLocalizedRoute(
                "JsonRightBoxItems",
                "{locale}/AI/JsonRightBoxItems",
                new { controller = "AI", action = "JsonRightBoxItems" }
            );


            /*routes.MapLocalizedRoute("SubReddah", "{locale}/r/{sub}",
                new { controller = "Articles", action = "SubReddah" }
            );
            routes.MapLocalizedRoute("UserArticles", "{locale}/user/{username}",
                new { controller = "Articles", action = "UserArticles" }
            );*/
            //articles by subreddah
            routes.MapLocalizedRoute("SubReddah", "{locale}/r/{sub}",
                new { controller = "AI", action = "UserProfile", menu = "bysub" }
            );
            //articles by user
            routes.MapLocalizedRoute("UserArticles", "{locale}/user/{user}",
                new { controller = "AI", action = "UserProfile", menu = "byuser" }
            );





            routes.MapLocalizedRoute("SubRandom", "{locale}/random",
                new { controller = "Articles", action = "RandomSubReddah" }
            );

            //static article
            routes.MapLocalizedRoute("StaticArticle", "{locale}/t/{*path}",
                new { controller = "Articles", action = "ClassicArticle" }
            );

            

            
            //comment
            routes.MapLocalizedRoute("ArticleComment", "{locale}/r/{group}/comments/{id}/{short}",
                new { controller = "Articles", action = "comments" }
            );

            routes.MapLocalizedRoute("AddComment", "{locale}/Article/JsonAddComment",
                 new { controller = "Articles", action = "JsonAddComment" }
             );

            routes.MapLocalizedRoute("DeleteComment", "{locale}/Article/JsonDelComment",
                 new { controller = "Articles", action = "JsonDelComment" }
             );

            //tools
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
                "Submit",
                "{locale}/submit",
                new { controller = "submit", action = "index" }
            );

            routes.MapLocalizedRoute(
                "Edit",
                "{locale}/edit/{id}",
                new { controller = "submit", action = "edit"}
            );

            routes.MapLocalizedRoute(
               "Delete",
               "{locale}/delete/{id}",
               new { controller = "submit", action = "delete" }
           );


            //routes.MapLocalizedRoute(
            //    "ArticleWithLocales",
            //    "{locale}/Articles/{*path}",
            //    new { controller = "Articles", action = "ClassicArticle" }
            //);



            routes.MapLocalizedRoute(
                "ChangeLocale",
                "{locale}/ChangeLocale/{*path}",
                new { controller = "Support", action = "ChangeLocale" }
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
                "JsonRegister",
                "{locale}/Account/JsonRegister",
                new { controller = "Account", action = "JsonRegister" }
            );

            routes.MapLocalizedRoute(
                "JsonVote",
                "{locale}/Articles/JsonVote",
                new { controller = "Articles", action = "JsonVote" }
            );

            routes.MapLocalizedRoute(
                "Register",
                "{locale}/account/register",
                new { controller = "account", action = "register" }
            );

            routes.MapLocalizedRoute(
                "Manage",
                "{locale}/account/manage",
                new { controller = "account", action = "manage" }
            );

            routes.MapLocalizedRoute(
                "ChangePassword",
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
                new { controller = "VerifyEmail", action = "index" }
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
                "SiteMap",
                "sitemap",
                new { controller = "UserCount", action = "index" }
            );

            routes.MapLocalizedRoute(
                "Upload",
                "upload",
                new { controller = "Articles", action = "Upload" }
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

            routes.MapLocalizedRoute(
                "webapi",
                "{locale}/api",
                new { controller = "Articles", action = "GetSub" }
            );
        }
    }
}
 