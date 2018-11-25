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
            var subReddahs = new List<Group>();
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

                ViewBag.SubReddahsCount = context.Groups.Count();
                var groups = (from g in context.Groups
                              orderby g.Id descending
                              select g);
                foreach (var item in groups)
                {
                    subReddahs.Add(item);
                }
                ViewBag.SubReddahs = subReddahs;

            }

            return View("~/Views/Account/Users.cshtml");
        }
     }
}
