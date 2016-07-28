using CaptchaMvc.Attributes;
using Reddah.Web.UI.Utility;
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
                    if (context.Groups.FirstOrDefault(g => g.Name == article.GroupName) == null)
                    {
                        context.Groups.Add(new Group { Name = article.GroupName });
                    }
                    context.Articles.Add(new Article
                    {
                        Title = article.Title,
                        GroupName = article.GroupName,
                        Content = Helpers.HideSensitiveWords(article.Content),
                        Abstract = article.Abstract,
                        UserName = User.Identity.Name,
                        CreatedOn = DateTime.Now
                    });
                    context.SaveChanges();
                }

                //return View("~/Views/Home/HomePageV1.cshtml");
                return RedirectToRoute("Support");
            }

            TempData["ErrorMessage"] = "Error: captcha is not valid.";
            return View();
        }
        
    }
}
