namespace Reddah.Web.UI.Controllers
{
    using System;
    using System.Linq;
    using System.Web.Mvc;

    using Reddah.Web.UI.ViewModels;
    using Reddah.Web.UI.Filters;
    using Reddah.Web.UI.Models;
    using System.Threading;
    using System.Web;

    public class ArticlesController : BaseController
    {
        public ActionResult Menu(string path, string page)
        {
            if (!System.IO.File.Exists(HttpContext.Server.MapPath("~/App_Data/" + path + ".xml")))
            {
                return new HttpNotFoundResult();
            }
            else
            {
                var PresentationTemplate = GetContentType(path);

                var presentationView = "~/Views/Articles/ArticleList.cshtml";

                int pageNo = 0;
                int.TryParse(page, out pageNo);
                
                return View(presentationView, new MenuArticleViewModel(path, PresentationTemplate, pageNo));
            }
        }

        public ActionResult ClassicArticle(string path, string category, string count)
        {
            if (!System.IO.File.Exists(HttpContext.Server.MapPath("~/App_Data/" + path + ".xml")))
            {
                return new HttpNotFoundResult();
                // ooopos page
                //*****////////throw new Exception();//yellow page in dev machine
                //throw new HttpException(404, "Application not found");//white page
                //return new HttpNotFoundResult();// transparent page
                //log
            }
            else
            {
                var PresentationTemplate = GetContentType(path);// get all content data here

                var presentationView = string.Format("~/Views/Articles/{0}.cshtml", PresentationTemplate);

                if (PresentationTemplate == "FamilyArticle")
                {
                    return View(presentationView, new FamilyArticleViewModel(path));
                }
                else if (PresentationTemplate == "NavigationList")
                {
                    return View(presentationView, new NavigationListViewModel(path));
                }
                else if (PresentationTemplate == "WizardSteps")
                {
                    return View(presentationView, new WizardStepsViewModel(path));
                }
                else if (PresentationTemplate == "Log")
                {
                    return View(presentationView, new DatabaseLogViewModel(path));
                }

                // SolutionArticle
                return View(presentationView, new SolutionArticleViewModel(path));
            }
            //    // Hide the header and footer
            //    ControllerContext.HttpContext.Items["HideShellHeaderAndFooter"] = true;
            //    var contentData = cosmosClient.TryGetSiteRegionalContent(path);
            //    var SGSupportedTemplate = new List<string> { "Support-Generic - FamilyPage",
            //                                                 "Support-Generic - SolutionArticlePage"
            //                                               };
            //    var SGWizardTemplateList = new List<string> { "Support-Generic - WizardPage",
            //                                                 "Support-Generic - WizardSteps"
            //                                               };


            //    if (contentData.ContentItem.PresentationTemplate == "Redirect")
            //    {
            //        var targetUrl = contentData.ContentItem["RedirectDestination"].Value;
            //        contentData = cosmosClient.TryGetSiteRegionalContent(Helpers.RemoveLocaleFromPath(targetUrl));
            //    }

            //    if (contentData != null && contentData.ContentItem != null)
            //    {
            //        var presentationView = contentData.ContentItem.PresentationTemplate;
            //        if (SGSupportedTemplate.Contains(presentationView))
            //        {
            //            if (browserCapability.IsMobile && !browserCapability.IsTablet)
            //            {
            //                presentationView = "~/Views/SmartGlass/" +
            //                                   contentData.ContentItem.PresentationTemplate +
            //                                   "_Companion.mobile.cshtml";
            //            }
            //            else
            //            {
            //                presentationView = "~/Views/SmartGlass/" +
            //                                   contentData.ContentItem.PresentationTemplate +
            //                                   "_Companion.cshtml";
            //            }
            //            return View(presentationView, contentData);
            //        }
            //        if (SGWizardTemplateList.Contains(presentationView))
            //        {
            //            return CompanionWizard(locale, path, currentStepPath, currentStepIndex, currentSolutionIndex);
            //        }
            //    }
            //    throw new HttpException(404, "Companion : Article page not found");
            //}
        }

        public ActionResult SubReddah(string sub, int count = 25)
        {
            return View("~/Views/Articles/ArticleList.cshtml", new SubArticleViewModel(sub, count));
        }

        public ActionResult RandomSubReddah()
        {
            var subName = new SubArticleViewModel().GetRandomSub();
            return Redirect(string.Format("/{0}/r/{1}", Thread.CurrentThread.CurrentCulture, subName));
        }

        public ActionResult UserArticles(string userName, string count)
        {
            var presentationView = "~/Views/Articles/UserArticleList.cshtml";

            return View(presentationView, new UserArticleViewModel(userName, count));
        }

        public ActionResult Comments(string id, string count)
        {
            int articleId = -1;
            if (int.TryParse(id, out articleId))
            {
                var presentationView = "~/Views/Articles/ArticleComment.cshtml";

                return View(presentationView, new ArticleCommentViewModel(articleId, count));
            }
            else 
            {
                throw new HttpException(404, "Reddah : Article not found");
            }
        }

        public ActionResult Error(string path)
        {
            var presentationView = string.Format("~/Views/Error.cshtml");

            return View(presentationView);
        }

        [Authorize]
        [HttpPost]
        public JsonResult JsonVote(VoteModel model)
        {
            var errors = string.Empty;
            if (model.ArticleId < 0)
            {
                errors = "Article does not exist";
            }

            if (string.IsNullOrEmpty(errors))
            {
                try
                {
                    //todo: also update user info
                    using (var db = new reddahEntities1())
                    {
                        var article = db.Articles.FirstOrDefault(a => a.Id == model.ArticleId);
                        if (model.Value.ToLowerInvariant() == "up")
                        {
                            if(article.Up == null)
                            {
                                article.Up = 0;
                            }
                            article.Up += 1;
                        }
                        else 
                        {
                            if (article.Down == null)
                            {
                                article.Down = 0;
                            }
                            article.Down += 1;
                        }
                        db.SaveChanges();
                    }
                }
                catch(Exception e)
                {
                    errors = e.Message;
                }
            }

            if (!string.IsNullOrEmpty(errors))
            {
                return Json(new { errors = errors }); 
            }
            
            return Json(new { success = true });
        }

        [Authorize]
        [HttpPost]
        public JsonResult JsonAddComment(CommentModel model)
        {
            var errors = string.Empty;
            if (model.ArticleId < 0)
            {
                errors = "Article does not exist";
            }

            if (string.IsNullOrEmpty(errors))
            {
                try
                {
                    using (var db = new reddahEntities1())
                    {
                        db.Comments.Add(new Comment()
                        {
                            ArticleId = model.ArticleId,
                            ParentId = model.ParentId,
                            Content = model.Content,
                            CreatedOn = DateTime.Now,
                            UserName = User.Identity.Name
                        });

                        
                        var article = db.Articles.FirstOrDefault(a => a.Id == model.ArticleId);
                        if (article != null)
                        {
                            article.Count ++;
                        }

                        if (model.ParentId != -1)
                        {
                            var parentComment = db.Comments.FirstOrDefault(c => c.Id == model.ParentId);
                            if (parentComment != null)
                            {
                                parentComment.Count ++;
                            }
                        }
                        
                        db.SaveChanges();
                    }
                }
                catch (Exception e)
                {
                    errors = e.Message;
                }
            }

            if (!string.IsNullOrEmpty(errors))
            {
                return Json(new { errors = errors });
            }

            return Json(new { success = true });
        }
    }
}
