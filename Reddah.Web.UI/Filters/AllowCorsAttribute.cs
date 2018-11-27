using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading;
using System.Web.Mvc;
using WebMatrix.WebData;
using Reddah.Web.UI.Models;

namespace Reddah.Web.UI.Filters
{
    public class AllowCorsAttribute : ActionFilterAttribute
    {
        private string[] _domains;

        public AllowCorsAttribute(params string[] domains)
        {
            _domains = domains;
        }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var context = filterContext.RequestContext.HttpContext;
            //if (context.Request.UrlReferrer != null)
            //{
            //    var host = context.Request.UrlReferrer?.Host;
            //    if (host != null && _domains.Contains(host))
            //    {
            //        context.Response.AddHeader("Access-Control-Allow-Origin", $"http://{host}");
            //    }
            //}
            //else
            //{
            //    context.Response.AddHeader("Access-Control-Allow-Origin", "*");
            //}
            context.Response.AddHeader("Access-Control-Allow-Origin", "*");
            context.Response.AddHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT");
            context.Response.AddHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
            base.OnActionExecuting(filterContext);
        }
    }
}
