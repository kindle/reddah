namespace Reddah.Web.UI.Controllers
{
    using System.Linq;
    using System.Web.Mvc;

    using Reddah.Web.UI.ViewModels;
    using Reddah.Web.UI.Filters;
    using Reddah.Web.UI.Models;
    using System.Collections.Generic;
    using System.Web.Security;
    using System.Web.Script.Serialization;
    using System.IO;

    public class AIController : BaseController
    {
        public ActionResult UserProfile(UserProfileModel userProfileModel)
        {
            var presentationView = Request.Browser.IsMobileDevice ?
                    "~/Views/Articles/UserProfileArticleList.mobile.cshtml" : "~/Views/Articles/UserProfileArticleList.cshtml";

            return View(presentationView, null);//new UserProfileArticleViewModel(userProfileModel));
        }

        [AllowAnonymous]
        [HttpPost]
        [AjaxValidateAntiForgeryToken]
        public JsonResult JsonUserProfileArticles()
        {
            if (ModelState.IsValid)
            {
                try
                { 
                    var sr = new StreamReader(Request.InputStream);
                    var stream = sr.ReadToEnd();
                    JavaScriptSerializer js = new JavaScriptSerializer();
                    UserProfileModel userProfileModel = js.Deserialize<UserProfileModel>(stream);

                    return Json(new {
                        success = true,
                        result = new UserProfileArticleViewModel(userProfileModel)
                    });
                }
                catch (MembershipCreateUserException e)
                {
                    ModelState.AddModelError("", ErrorCodeToString(e.StatusCode));
                }
            }

            return Json(new { errors = GetErrorsFromModelState() });
        }

        private IEnumerable<string> GetErrorsFromModelState()
        {
            return ModelState.SelectMany(x => x.Value.Errors.Select(error => error.ErrorMessage));
        }

        [AllowAnonymous]
        [HttpPost]
        [AjaxValidateAntiForgeryToken]
        public JsonResult JsonRightBoxItems(UserProfileModel userProfileModel)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    return Json(new
                    {
                        success = true,
                        result = new ArticleViewModelBase()
                    });
                }
                catch (MembershipCreateUserException e)
                {
                    ModelState.AddModelError("", ErrorCodeToString(e.StatusCode));
                }
            }

            return Json(new { errors = GetErrorsFromModelState() });
        }

    }
}
