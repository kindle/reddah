using System.Web;
using System.Web.Routing;

namespace Reddah.Web.UI.Routing
{
    public class AcceptedLocaleConstraint : IRouteConstraint
    {
        private readonly ICultureValidator cultureValidator;

        public AcceptedLocaleConstraint(ICultureValidator cultureValidator)
        {
            this.cultureValidator = cultureValidator;
        }

        public bool Match(HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection)
        {
            return (cultureValidator.IsValidUrlCultureName((string)values[parameterName]));
        }
    }
}