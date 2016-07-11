using System.Web.Mvc;
using System.Linq;
using System.Collections.Generic;

namespace Reddah.Web.UI.Controllers
{
    public class UserCountController : Controller
    {
        private readonly log4net.ILog log = log4net.LogManager.GetLogger("UserCountController");

        public ActionResult Index() 
        {
            var topList = new List<UserProfile>();
            using (var context = new reddahEntities1())
            {
                ViewBag.UserCount = context.UserProfiles.Count();
                var top = (from q in context.UserProfiles
                           orderby q.UserId descending
                           select q).Take(20);
                foreach (var item in top)
                {
                    topList.Add(item);
                }
                ViewBag.Top = topList;
            }

            return View("~/Views/Account/Users.cshtml");
        }        
    }
}
