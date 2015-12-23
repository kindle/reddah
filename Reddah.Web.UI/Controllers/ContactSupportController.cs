using System.Globalization;
using System.Web.Mvc;

using Reddah.Web.UI.ViewModels.ContactSupport;

namespace Reddah.Web.UI.Controllers
{
    public class ContactSupportController : Controller
    {
        public ActionResult ContactSupportV2(string path)
        {
            var compassPath = string.IsNullOrEmpty(path)
                                  ? "/" + CultureInfo.CurrentUICulture.Name + "/contact-us"
                                  : path;

            return View("~/Views/ContactSupport/ContactSupportClassicV2.cshtml", new ProductsViewModel());
        }

        [HttpGet]
        public ActionResult GetContactUsProductsWithCategories(string path)
        {
            var categoriesViewModel = new CategoriesViewModel(path);
            //if (contactSupportModel.IsAlphaSorted)
            //{
            //    var contactUsAppsColumnsModel = contactSupportModel.BuildAppsProductColumns();
            //    return View("~/Views/Shared/Controls/ContactSupport/ContactUsAppsColumns.cshtml", contactUsAppsColumnsModel);
            //}
            return View("~/Views/Shared/Controls/ContactSupport/Categories.cshtml", categoriesViewModel);
        }
    }
}
