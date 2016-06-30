using System.Web.Mvc;
using System.Linq;

namespace Reddah.Web.UI.Controllers
{
    public class UserCountController : Controller
    {
        private readonly log4net.ILog log = log4net.LogManager.GetLogger("UserCountController");

        public ActionResult Index() 
        {
            using (var context = new reddahEntities1())
            {
                ViewBag.UserCount = context.UserProfiles.Count();
                
            }

            return View("~/Views/Account/Users.cshtml");
        }        
    }
}
