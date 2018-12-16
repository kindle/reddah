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
    using System.Collections.Generic;
    using System.Web.Security;

    public class AIController : BaseController
    {
        public ActionResult UserProfile(UserProfileModel userProfileModel)
        {
            var presentationView = Request.Browser.IsMobileDevice ?
                    "~/Views/Articles/UserProfileArticleList.mobile.cshtml" : "~/Views/Articles/UserProfileArticleList.cshtml";

            return View(presentationView, new UserProfileArticleViewModel(userProfileModel));
        }

        [AllowAnonymous]
        [HttpPost]
        [AjaxValidateAntiForgeryToken]
        public JsonResult JsonUserProfileArticles(UserProfileModel userProfileModel)
        {
            if (ModelState.IsValid)
            {
                try
                {
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

    }
}
