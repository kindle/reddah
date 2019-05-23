using CaptchaMvc.Attributes;
using Reddah.Web.UI.Utility;
using System;
using System.Linq;
using System.Web.Mvc;
using System.Globalization;

namespace Reddah.Web.UI.Controllers
{
    public class SubmitController : Controller
    {
        public ActionResult Index(string group)
        {
            Article article = new Article();
            if(!String.IsNullOrEmpty(group))
                article.GroupName = Helpers.HtmlEncode(group.Replace(" ", "").Replace("，", ",")); 
            return View("~/Views/Submit/Index.cshtml", article);
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
                    string longArticleGroupNames = Helpers.HtmlEncode(article.GroupName.Replace(" ", "").Replace("，",","));
                    String[] articleGroupNames = longArticleGroupNames.Split(',');
                    foreach(string articleGroupName in articleGroupNames)
                    {
                        if (context.Groups.FirstOrDefault(g => g.Name == articleGroupName.Trim()) == null)
                        {
                            context.Groups.Add(new Group
                            {
                                Name = articleGroupName.Trim(),
                                CreatedOn = DateTime.Now
                            });
                        }
                    }
                    
                    context.Articles.Add(new Article
                    {
                        Title = Helpers.HtmlEncode(article.Title),
                        GroupName = longArticleGroupNames,
                        Content = Helpers.HtmlEncode(article.Content),
                        Abstract = Helpers.HtmlEncode(article.Abstract),
                        UserName = User.Identity.Name,
                        CreatedOn = DateTime.Now,
                        Locale = CultureInfo.CurrentUICulture.Name.ToLowerInvariant(),
                        Type = 0 //0 article, 1 timeline
                    });
                    context.SaveChanges();
                }
                
                return RedirectToRoute("New");
            }

            TempData["ErrorMessage"] = "Error: captcha is not valid.";
            return View();
        }



        public ActionResult Edit(int id)
        {
            ViewBag.Id = id;

            Article article = null;

            using (var context = new reddahEntities1())
            {
                article = context.Articles.FirstOrDefault(x => x.Id == id);
                article.Title = Helpers.HtmlDecode(article.Title);
                article.Abstract = Helpers.HtmlDecode(article.Abstract);
                article.Content = Helpers.HtmlDecode(article.Content);
            }

            if (!(User.Identity.Name.Equals(article.UserName) || Helpers.Acl(User.Identity.Name, PrivilegeList.EditPost)))
            {
                ViewBag.Error = "you can't edit other people's post!";
            }

            return View("~/Views/Submit/edit.cshtml", article);
        }

        [HttpPost, CaptchaVerify("Captcha is not valid")]
        [Authorize]
        [ValidateAntiForgeryToken]
        [ValidateInput(false)]
        public ActionResult Edit(Article article)
        {
            //current user can do this
            //bool valid = (Helpers.HtmlDecode(User.Identity.Name) == Helpers.HtmlDecode(article.UserName));

            if (ModelState.IsValid)// && valid)
            {
                TempData["Message"] = "Message: captcha is valid.";
                using (var context = new reddahEntities1())
                {
                    var existingArticle = context.Articles.FirstOrDefault(x => x.Id == article.Id);

                    if (User.Identity.Name.Equals(existingArticle.UserName) || Helpers.Acl(User.Identity.Name, PrivilegeList.EditPost))
                    {
                        string longArticleGroupNames = Helpers.HtmlEncode(article.GroupName.Replace(" ", "").Replace("，", ","));
                        String[] articleGroupNames = longArticleGroupNames.Split(',');
                        foreach (string articleGroupName in articleGroupNames)
                        {
                            if (context.Groups.FirstOrDefault(g => g.Name == articleGroupName.Trim()) == null)
                            {
                                context.Groups.Add(new Group
                                {
                                    Name = articleGroupName.Trim(),
                                    CreatedOn = DateTime.Now
                                });
                            }
                        }

                        existingArticle.Title = Helpers.HtmlEncode(article.Title);
                        existingArticle.GroupName = longArticleGroupNames;
                        existingArticle.Content = Helpers.HtmlEncode(article.Content);
                        existingArticle.Abstract = Helpers.HtmlEncode(article.Abstract);
                        existingArticle.LastUpdateOn = DateTime.Now;

                        context.SaveChanges();
                    }
                    else
                    {
                        throw new Exception("you do not have permission to edit the post!");
                    }
                }

                //return RedirectToRoute(new { controller = "ArticleComment", action = "comments", id = article.Id });
                //http://localhost/en-US/r/world/comments/130/test2ddd/
                return Redirect(string.Format("/{0}/r/{1}/comments/{2}/{3}", CultureInfo.CurrentUICulture.Name, Helpers.GetUrlTitle(article.GroupName), article.Id, Helpers.GetUrlTitle(article.Title)));
            }

            TempData["ErrorMessage"] = "Error: captcha is not valid.";
            return View();
        }

        [Authorize]
        [ValidateInput(false)]
        public ActionResult Delete(Article article)
        {
            if (ModelState.IsValid)
            {
                TempData["Message"] = "Message: captcha is valid.";
                using (var context = new reddahEntities1())
                {
                    var existingArticle = context.Articles.FirstOrDefault(x => x.Id == article.Id);

                    if (!User.Identity.Name.Equals(existingArticle.UserName))
                    {
                        throw new Exception("you can't delete other people's post!");
                    }

                    context.Articles.Remove(existingArticle);
                    context.SaveChanges();
                }

                return RedirectToRoute(new { controller = "ArticleComment", action = "comments", id = article.Id });
                //http://localhost/en-US/r/world/comments/130/test2ddd/
            }

            TempData["ErrorMessage"] = "Error: captcha is not valid.";
            return View();
        }
    }
}
