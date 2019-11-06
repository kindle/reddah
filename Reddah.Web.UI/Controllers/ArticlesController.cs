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
    using Reddah.Web.UI.Utility;
    using System.IO;
    using Newtonsoft.Json;

    //using System.Net.Http;
    //using System.Web.Http;
    //using System.Web.Http.Cors;

    public class ArticlesController : BaseController
    {
        private string getViewByDevice(){
            return Request.Browser.IsMobileDevice ?
                    "~/Views/Articles/ArticleList.mobile.cshtml" : "~/Views/Articles/ArticleList.cshtml";
        }

        public ActionResult Menu(string path, string page)
        {
            if (!System.IO.File.Exists(HttpContext.Server.MapPath("~/App_Data/" + path + ".xml")))
            {
                return new HttpNotFoundResult();
            }
            else
            {
                var PresentationTemplate = GetContentType(path);

                var presentationView = getViewByDevice();

                int pageNo = 0;
                int.TryParse(page, out pageNo);
                
                return View(presentationView, new MenuArticleViewModel(path, PresentationTemplate, pageNo));
            }
        }

        //ionic api
        [HttpGet]
        [AllowCors("*","*")]
        public JsonResult GetSub(string sub, int count = 25)
        {
            //string sub = "PICS";
            //int count = 25;
            if(String.IsNullOrEmpty(sub))
                sub = new SubArticleViewModel().GetRandomSub();

            return Json(new SubArticleViewModel(sub, count).Articles, JsonRequestBehavior.AllowGet);
        }


        /*public System.Net.Http.HttpResponseMessage GetSub(string sub, int count = 25)
        {
            //string sub = "PICS";
            //int count = 25;
            if (String.IsNullOrEmpty(sub))
                sub = new SubArticleViewModel().GetRandomSub();

            ///return Json(new SubArticleViewModel(sub, count).Articles, JsonRequestBehavior.AllowGet);
            return new System.Net.Http.HttpResponseMessage()
            {
                Content = new System.Net.Http.StringContent(Json(new SubArticleViewModel(sub, count).Articles, JsonRequestBehavior.AllowGet).ToString())
            };
        }*/

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
                    presentationView = Request.Browser.IsMobileDevice ?
                    "~/Views/Articles/FamilyArticle.mobile.cshtml" : "~/Views/Articles/FamilyArticle.cshtml";
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

                presentationView = Request.Browser.IsMobileDevice ?
                    "~/Views/Articles/SolutionArticle.mobile.cshtml" : "~/Views/Articles/SolutionArticle.cshtml";

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
            return View(getViewByDevice(), new SubArticleViewModel(sub, count));
        }

        public ActionResult RandomSubReddah()
        {
            var subName = new SubArticleViewModel().GetRandomSub();
            return Redirect(string.Format("/{0}/r/{1}", Thread.CurrentThread.CurrentCulture, subName));
        }

        public ActionResult UserArticles(string userName, string page)
        {
            var presentationView = getViewByDevice();

            int pageNo = 0;
            int.TryParse(page, out pageNo);

            return View(presentationView, new UserArticleViewModel(userName, pageNo));
        }

        public ActionResult Comments(string group, string id, string count)
        {
            int articleId = -1;
            if (int.TryParse(id, out articleId))
            {
                var presentationView = Request.Browser.IsMobileDevice ?
                    "~/Views/Articles/ArticleComment.mobile.cshtml" : "~/Views/Articles/ArticleComment.cshtml"; 

                return View(presentationView, new ArticleCommentViewModel(group, articleId, count));
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
                            Content = System.Web.HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(model.Content))),
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

        [Authorize]
        [HttpPost]
        public JsonResult JsonDelComment(CommentModel model)
        {
            var errors = string.Empty;
            
            try
            {
                using (var db = new reddahEntities1())
                {
                    db.Comments.FirstOrDefault(x => x.Id == model.ArticleId).Status = -1;
                    db.SaveChanges();
                }
            }
            catch (Exception e)
            {
                errors = e.Message;
            }
        
            if (!string.IsNullOrEmpty(errors))
            {
                return Json(new { errors = errors });
            }

            return Json(new { success = true });
        }

        [Authorize]
        [HttpPost]
        public ContentResult Upload(HttpPostedFileBase upload)
        {
            string guid = Guid.NewGuid().ToString().Replace("-","");
            string uploadedImagePath = "/uploadPhoto/";
            string uploadImageServerPath = "~" + uploadedImagePath;


            if (!upload.ContentType.Contains("image"))
            {
                return Content("<script type=\"text/javascript\">window.parent.CKEDITOR.tools.callFunction(window.parent.CKEDITOR.instances.Content._.filebrowserFn,''," 
                    + "'File format Error: (must be .jpg/.gif/.bmp/.png)');</script>");
            }
            else
            {
                var fileFormat = upload.FileName.Substring(upload.FileName.LastIndexOf('.')).Replace(".","");
                var fileName = Path.GetFileName(guid + "." + fileFormat);
                var filePhysicalPath = Server.MapPath(uploadImageServerPath + "/"  + fileName);
                if (!Directory.Exists(Server.MapPath(uploadImageServerPath)))
                {
                    Directory.CreateDirectory(Server.MapPath(uploadImageServerPath));
                }
                upload.SaveAs(filePhysicalPath);
                var url = uploadedImagePath + fileName;

                using (var db = new reddahEntities1())
                {
                    UploadFile file = new UploadFile();
                    file.Guid = guid;
                    file.Format = fileFormat;
                    file.UserName = User.Identity.Name;
                    file.CreatedOn = DateTime.Now;
                    file.GroupName = "";
                    file.Tag = "";
                    db.UploadFiles.Add(file);
                    db.SaveChanges();
                }

                return Content("<script>window.parent.CKEDITOR.tools.callFunction(window.parent.CKEDITOR.instances.Content._.filebrowserFn, \"" + url + "\");</script>");
            }
        }
    }
}
