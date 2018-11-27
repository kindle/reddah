namespace Reddah.Web.UI.Controllers
{
    using System;
    using System.Linq;
    using System.Web.Mvc;

    using Reddah.Web.UI.ViewModels;
    using Reddah.Web.UI.Filters;
    using Reddah.Web.UI.Models;
    using System.Threading;
    using System.Web;
    using Reddah.Web.UI.Utility;

    public class WebApiController : Controller
    {
        //[Authorize]
        [HttpGet]
        public String test()
        {
            return "hello";
        }

        [HttpGet]
        public String article()
        {
            return "articles";
        }
    }
}
