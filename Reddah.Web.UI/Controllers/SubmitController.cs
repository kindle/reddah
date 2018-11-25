using CaptchaMvc.Attributes;
using Reddah.Web.UI.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Reddah.Web.UI.Utility;
using System.Globalization;

namespace Reddah.Web.UI.Controllers
{
    public class SubmitController : Controller
    {
        public ActionResult Index()
        {
            return View("~/Views/Submit/Index.cshtml");
        }

        [HttpPost, CaptchaVerify("Captcha is not valid")]
        [Authorize]
        [ValidateAntiForgeryToken]
        [ValidateInput(false)]
        public ActionResult Index(Article article)
        {
            if (ModelState.IsValid)
            {
                TempData["Message"] = "Message: captcha is valid.";
                using (var context = new reddahEntities1())
                {
                    String articleGroupName = Helpers.HtmlEncode(article.GroupName);
                    if (context.Groups.FirstOrDefault(g => g.Name == articleGroupName) == null)
                    {
                        context.Groups.Add(new Group {
                            Name = articleGroupName,
                            CreatedOn = DateTime.Now
                        });
                    }
                    context.Articles.Add(new Article
                    {
                        Title = Helpers.HtmlEncode(article.Title),
                        GroupName = articleGroupName,
                        Content = Helpers.HtmlEncode(article.Content),
                        Abstract = Helpers.HtmlEncode(article.Abstract),
                        UserName = User.Identity.Name,
                        CreatedOn = DateTime.Now,
                        Locale = CultureInfo.CurrentUICulture.Name.ToLowerInvariant()
                    });
                    context.SaveChanges();
                }

                //return View("~/Views/Home/HomePageV1.cshtml");
                return RedirectToRoute("New");
            }

            TempData["ErrorMessage"] = "Error: captcha is not valid.";
            return View();
        }
        
    }
}
