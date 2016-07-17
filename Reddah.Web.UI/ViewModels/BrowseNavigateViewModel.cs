using System;
using System.Collections.Generic;
using System.Linq;

using Reddah.Web.UI.Models;

namespace Reddah.Web.UI.ViewModels
{
    public class BrowseNavigateViewModel
    {
        public string Title { get; set; }
        public List<ArticlePreview> ArticlePreviews { get; set; }

        private readonly string currentProductName;
        private readonly string currentCategoryName;
        private readonly NavigationListViewModel rootNavigationList; 

        public BrowseNavigateViewModel(string product, string category)
        {
            this.currentProductName = product;
            this.currentCategoryName = category;

            this.rootNavigationList = new NavigationListViewModel("wiki/Pages/NavigationList");
        }

        public List<BrowseProductViewModel> Products 
        { 
            get 
            { 
                var products = new List<BrowseProductViewModel>();
                BrowseProductViewModel.GetProductSettings("wiki/Pages/BrowseNavigate");

                if(this.rootNavigationList != null)
                {
                    foreach (var child in this.rootNavigationList.Folders)
                    {
                        if(child.ArticleUrl.ToLower().Contains("navigationlist") &&
                            !products.Any(product => product.Title.Equals(child.Title, StringComparison.InvariantCultureIgnoreCase)))
                        {
                            var product = this.CreateProduct(child, this.currentProductName, this.currentCategoryName);
                            if(product != null)
                            {
                                products.Add(product);
                            }
                        }
                    }
                }

                return products;
            } 
        }

        private BrowseProductViewModel CreateProduct(Models.ArticlePreview field, string currentProduct, string currentCategory)
        {
            if ((field != null) && field.ArticleUrl.ToLower().Contains("navigationlist"))
            {
                var product = new BrowseProductViewModel
                              {
                                  Title = field.Title,
                                  NavigationListUrl = field.ArticleUrl.ToLower()
                              };

                if(product.NavigationListUrl.Split('/').Length > 0)
                {
                    product.CompassIdentifier = product.NavigationListUrl.Replace("wiki/pages/", "").Split('/')[0];
                }

                product.GetCategories(product.NavigationListUrl, currentProduct, currentCategory);
                return product;
            }

            return null;
        }

    }
}