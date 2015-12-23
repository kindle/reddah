namespace Reddah.Web.UI.Controllers
{
    using System;
    using System.Web.Mvc;

    using Reddah.Web.UI.ViewModels;

    public class ArticlesController : BaseController
    {
        //
        // GET: /Articles/

        //public ActionResult ClassicArticle(string locale, string path)
        //{
        //    return ClassicArticle(path);
        //}

        public ActionResult ClassicArticle(string path, string category, string count)
        {
            if (!System.IO.File.Exists(HttpContext.Server.MapPath("~/Content/" + path + ".xml")))
            {
                //return new HttpNotFoundResult();
                // ooopos page
                throw new Exception();//yellow page in dev machine
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
                else if (PresentationTemplate == "TopList")
                {
                    return View(presentationView, new DatabaseTopListViewModel(path));
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

        public ActionResult Error(string path)
        {
            var presentationView = string.Format("~/Views/Error.cshtml");

            return View(presentationView);
        }
    }
}
