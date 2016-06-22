using CaptchaMvc.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.Xml;
using log4net;

namespace Reddah.Web.UI.Controllers
{
    public class QQController : Controller
    {
        public ActionResult Index() 
        {
            

            return View();
        }
    }
}
