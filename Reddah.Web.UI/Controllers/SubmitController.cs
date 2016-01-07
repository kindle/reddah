using CaptchaMvc.Attributes;
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
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult Index(Article article)
        {
            if (ModelState.IsValid)
            {
                TempData["Message"] = "Message: captcha is valid.";
                using (var context = new reddahEntities1())
                {
                    context.Articles.Add(new Article
                    {
                        Title = article.Title,
                        Content = article.Content
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
