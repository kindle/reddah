using System;
using System.Web.Routing;
using System.Web;
using System.Threading;
using System.Globalization;

namespace Reddah.Web.UI.Routing
{
    public class LocalizedRoute : Route
    {
        public LocalizedRoute(string url, IRouteHandler routeHandler)
            : base(url, routeHandler)
        {
        }

        public LocalizedRoute(string url, RouteValueDictionary defaults, IRouteHandler routeHandler)
            : base(url, defaults, routeHandler)
        {
        }

        public LocalizedRoute(string url, RouteValueDictionary defaults, RouteValueDictionary constraints, IRouteHandler routeHandler)
            : base(url, defaults, constraints, routeHandler)
        {
        }

        public LocalizedRoute(string url, RouteValueDictionary defaults, RouteValueDictionary constraints, RouteValueDictionary dataTokens, IRouteHandler routeHandler)
            : base(url, defaults, constraints, dataTokens, routeHandler)
        {
        }

        public override RouteData GetRouteData(HttpContextBase httpContext)
        {
            RouteData data = base.GetRouteData(httpContext);

            if (data != null)
            {
                string locale = (string)data.Values["locale"];
                if (!String.IsNullOrEmpty(locale))
                {
                    try
                    {
                        var culture = CultureInfo.GetCultureInfo(locale);
                        if (culture.IsNeutralCulture)
                        {
                            return null;
                        }
                        Thread.CurrentThread.CurrentCulture = culture;
                        Thread.CurrentThread.CurrentUICulture = culture;
                    }
                    catch (ArgumentException)
                    {
                        return null;
                    }
                }
            }

            return data;
        }

        public override VirtualPathData GetVirtualPath(RequestContext requestContext, RouteValueDictionary values)
        {
            if (!values.ContainsKey("locale") && !requestContext.RouteData.Values.ContainsKey("locale"))
            {
                values["locale"] = Thread.CurrentThread.CurrentUICulture.Name;
            }
            return base.GetVirtualPath(requestContext, values);
        }
    }
}