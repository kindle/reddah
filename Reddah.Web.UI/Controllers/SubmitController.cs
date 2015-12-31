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
            return View("~/Views/Submit/Index.cshtml");
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult Index(Article article)
        {
            using (var context = new reddahEntities1())
            {
                context.Articles.Add(new Article
                {
                    Title = article.Title,
                    Content = article.Content
                });
                context.SaveChanges();
            }

            return View();
        }
        
    }
}
