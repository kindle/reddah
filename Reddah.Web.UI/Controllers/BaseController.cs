using System.Xml;
using System.Web.Mvc;

namespace Reddah.Web.UI.Controllers
{
    public class BaseController : Controller
    {
        protected string GetContentType(string path)
        {
            var doc = new XmlDocument();

            doc.Load(HttpContext.Server.MapPath("~/App_Data/" + path + ".xml"));

            return doc.SelectSingleNode("ContentType/@Name").Value;
        }
    }
}
