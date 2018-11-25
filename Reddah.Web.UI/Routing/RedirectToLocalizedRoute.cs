using System;
using System.Globalization;
using System.Web;
using System.Web.Routing;

namespace Reddah.Web.UI.Routing
{
    public class RedirectToLocalizedHandler : IRouteHandler, IHttpHandler
    {
        //public static Func<IRequestSecurity> RequestSecurity = IoC.Get<IRequestSecurity>;

        public IHttpHandler GetHttpHandler(RequestContext requestContext)
        {
            return this;
        }

        public bool IsReusable
        {
            get { return true; }
        }

        public void ProcessRequest(HttpContext httpContext)
        {
            var httpRequest = new HttpRequestWrapper(httpContext.Request);
            //var culture = IoC.Get<IReddahCultureProvider>().GetCurrentCultureInfo();
            var culture = new CultureInfo("en-US");

            var newUri = ConstructRedirectUrl(httpRequest, culture);

            httpContext.Response.Status = "302 Found";
            httpContext.Response.StatusCode = 302;
            httpContext.Response.AppendHeader("Location", newUri.ToString());
            httpContext.Response.AppendHeader("Access-Control-Allow-Origin", "*");
            httpContext.Response.AppendHeader("Access-Control-Allow-Credentials", "true");
            httpContext.Response.AppendHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT");
            httpContext.Response.AppendHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
        }

        //public UriBuilder ConstructRedirectUrl(HttpRequestBase httpRequest, IReddahCultureInfo culture)
        public UriBuilder ConstructRedirectUrl(HttpRequestBase httpRequest, CultureInfo culture)
        {
            if (httpRequest.Url == null)
            {
                throw new ArgumentException();
            }
            var newUri = new UriBuilder(httpRequest.Url);
            newUri.Path = culture.Name + newUri.Path;

            // TODO: Investigate using relative paths instead.
            // When SSL terminated on loadblancer incoming Url is always HTTP - chane redirect schema if original incoming url was https.
            if (newUri.Scheme.Equals("http", StringComparison.OrdinalIgnoreCase) /*&& RequestSecurity().IsSecure()*/)
            {
                //newUri.Scheme = Uri.UriSchemeHttps;
                // SSL termination as of 2012-10 w is not configured for custom SSL ports, so using default SSL port for all constructed https Urls.
                // If this ever to change need to figure how to pass port of original request down from loadbalancer (probably similar header).
                newUri.Port = -1;
            }
            return newUri;
        }
    }
}