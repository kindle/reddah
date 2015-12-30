using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Reddah.Web.UI.Controllers
{
    public class SubmitController : Controller
    {
        public ActionResult Index()
        {
            return View("~/Views/Submit/Index.cshtml", "");
        }
    }
}
