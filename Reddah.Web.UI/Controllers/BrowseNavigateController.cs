using System.Linq;

using Reddah.Web.UI.ViewModels;
using System;
using System.Web.Mvc;

namespace Reddah.Web.UI.Controllers
{
    public class BrowseNavigateController : Controller
    {
        public const string DefaultProduct = "apps";

        public ActionResult BrowseNavigate(string product, string category)
        {
            if (String.IsNullOrEmpty(product))
            {
                product = DefaultProduct;
            }

            if (String.IsNullOrEmpty(category))
            {
                category = Resources.Resources.Browse_TopIssues;
            }

            var viewModel = new BrowseNavigateViewModel(product, category);
            var currentProduct = viewModel.Products.FirstOrDefault(prd => prd.Title.Equals(product, StringComparison.OrdinalIgnoreCase));

            if(currentProduct != null)
            {
                var currentCategory = category.Equals(Resources.Resources.Browse_TopIssues)
                                          ? currentProduct.Categories.FirstOrDefault()
                                          : currentProduct.Categories.FirstOrDefault(ct =>ct.Link.Equals(string.Format("?product={0}&category={1}", product, category), StringComparison.OrdinalIgnoreCase));

                if(currentCategory != null)
                {
                    viewModel.Title = string.Format("{0} : {1}", currentProduct.Title, currentCategory.Title);
                    viewModel.ArticlePreviews = currentCategory.ArticlePreviews;
                    return View("BrowseNavigate", viewModel);
                }
            }

            return new HttpNotFoundResult();
        }

        [HttpGet]
        public ActionResult GetPreviewsArticlesFragment()
        {
            string path = Request.QueryString["path"];

            var contentData = new NavigationListViewModel(path);
            return View("~/Views/Shared/Controls/ArticlesPreviewsModule.ascx", contentData.Articles);
        }

    }
}
