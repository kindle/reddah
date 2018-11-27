using Reddah.Web.UI.Filters;
using System.Web;
using System.Web.Mvc;

namespace Reddah.Web.UI
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
            filters.Add(new AllowCorsAttribute());
        }
    }
}