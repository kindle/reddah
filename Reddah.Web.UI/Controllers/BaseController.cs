using System.Xml;
using System.Web.Mvc;
using System.Globalization;

namespace Reddah.Web.UI.Controllers
{
    public class BaseController : Controller
    {
        protected string GetContentType(string path)
        {
            var doc = new XmlDocument();

            var locale = CultureInfo.CurrentUICulture.Name;
            if (!System.IO.File.Exists(HttpContext.Server.MapPath("~/App_Data/" + path + "." + locale + ".xml")))
            {
                doc.Load(HttpContext.Server.MapPath("~/App_Data/" + path + ".xml"));
            }
            else 
            {
                doc.Load(HttpContext.Server.MapPath("~/App_Data/" + path + "." + locale + ".xml"));
            }

            return doc.SelectSingleNode("ContentType/@Name").Value;
        }
    }
}
