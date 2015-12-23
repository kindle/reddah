using System;
using System.Web.Mvc;
using System.Web.Routing;

namespace Reddah.Web.UI.Routing
{
    /// <summary>
    /// Contents are copied from the framework's RouteCollectionExtensions class and modified
    /// </summary>
    public static class RoutingExtensions
    {
        public static LocalizedRoute MapLocalizedRoute(this RouteCollection routes, string name, string url)
        {
            return routes.MapLocalizedRoute(name, url, null, null);
        }

        public static LocalizedRoute MapLocalizedRoute(this RouteCollection routes, string name, string url, object defaults)
        {
            return routes.MapLocalizedRoute(name, url, defaults, null);
        }

        public static LocalizedRoute MapLocalizedRoute(this RouteCollection routes, string name, string url, string[] namespaces)
        {
            return routes.MapLocalizedRoute(name, url, null, null, namespaces);
        }

        public static LocalizedRoute MapLocalizedRoute(this RouteCollection routes, string name, string url, object defaults, object constraints)
        {
            return routes.MapLocalizedRoute(name, url, defaults, constraints, null);
        }

        public static LocalizedRoute MapLocalizedRoute(this RouteCollection routes, string name, string url, object defaults, string[] namespaces)
        {
            return routes.MapLocalizedRoute(name, url, defaults, null, namespaces);
        }

        public static LocalizedRoute MapLocalizedRoute(this RouteCollection routes, string name, string url, object defaults, object constraints, string[] namespaces)
        {
            return routes.MapRoute(name, url, defaults, constraints, namespaces, u => new LocalizedRoute(u, new MvcRouteHandler()));
        }

        public static T MapRoute<T>(this RouteCollection routes, string name, string url, object defaults, object constraints, string[] namespaces, Func<string, T> routeConstructor) where T : Route
        {
            if (routes == null)
            {
                throw new ArgumentNullException("routes");
            }
            if (url == null)
            {
                throw new ArgumentNullException("url");
            }

            var item = routeConstructor(url);
            item.Defaults = new RouteValueDictionary(defaults);
            item.Constraints = (constraints is RouteValueDictionary) ? (RouteValueDictionary)constraints : new RouteValueDictionary(constraints);
            if ((namespaces != null) && (namespaces.Length > 0))
            {
                item.DataTokens = new RouteValueDictionary();
                item.DataTokens["Namespaces"] = namespaces;
            }
            routes.Add(name, item);
            return item;
        }

        public static Route MapAutoLocalizedRoute(this RouteCollection routes, ICultureValidator cultureValidator, string name, string url)
        {
            return routes.MapAutoLocalizedRoute(cultureValidator, name, url, null, null);
        }

        public static Route MapAutoLocalizedRoute(this RouteCollection routes, ICultureValidator cultureValidator, string name, string url, object defaults)
        {
            return routes.MapAutoLocalizedRoute(cultureValidator, name, url, defaults, null);
        }

        public static Route MapAutoLocalizedRoute(this RouteCollection routes, ICultureValidator cultureValidator, string name, string url, string[] namespaces)
        {
            return routes.MapAutoLocalizedRoute(cultureValidator, name, url, null, null, namespaces);
        }

        public static Route MapAutoLocalizedRoute(this RouteCollection routes, ICultureValidator cultureValidator, string name, string url, object defaults, object constraints)
        {
            return routes.MapAutoLocalizedRoute(cultureValidator, name, url, defaults, constraints, null);
        }

        public static Route MapAutoLocalizedRoute(this RouteCollection routes, ICultureValidator cultureValidator, string name, string url, object defaults, string[] namespaces)
        {
            return routes.MapAutoLocalizedRoute(cultureValidator, name, url, defaults, null, namespaces);
        }

        public static Route MapAutoLocalizedRoute(this RouteCollection routes, ICultureValidator cultureValidator, string name, string url, object defaults, object constraints, string[] namespaces)
        {
            var localizedConstraints = new RouteValueDictionary(constraints) { { "locale", new AcceptedLocaleConstraint(cultureValidator) } };
            Route route = routes.MapLocalizedRoute(name, "{locale}/" + url, defaults, localizedConstraints, namespaces);
            routes.MapRoute(name + "LocaleRedirect", url, defaults, constraints, namespaces, u => new Route(u, new RedirectToLocalizedHandler()));
            return route;
        }

    }

    public interface ICultureValidator
    {
        bool IsValidWebCultureName(string cultureName);
        bool IsValidUrlCultureName(string cultureName);
    }
}