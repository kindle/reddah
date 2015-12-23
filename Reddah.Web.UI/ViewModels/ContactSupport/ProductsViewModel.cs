using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

using Reddah.Web.UI.Models;

namespace Reddah.Web.UI.ViewModels.ContactSupport
{
    public class ProductsViewModel
    {
        private readonly NavigationListViewModel rootNavigationList;
        private readonly string navigationListPath;

        public ProductsViewModel()
        {
            this.navigationListPath = "Compass/Pages/NavigationList";
            this.rootNavigationList = new NavigationListViewModel(navigationListPath);
            this.RootProducts = GetRootProducts();
        }

        public IEnumerable<Product> RootProducts { get; private set; }

        private IEnumerable<Product> GetRootProducts()
        {
            var products = new List<Product>();

            int index = 0;
            if (rootNavigationList != null)
            {
                foreach (var child in rootNavigationList.Folders)
                {
                    if (child.ArticleUrl.ToLower().Contains("navigationlist") &&
                            !products.Any(product => product.Title.Equals(child.Title, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        var product = CreateProduct(child, index);
                        if (product != null)
                        {
                            products.Add(product);
                            index++;
                        }
                    }
                }
            }

            return products;
        }

        private Product CreateProduct(Models.ArticlePreview field, int index)
        {
            if ((field != null) && field.ArticleUrl.ToLower().Contains("navigationlist"))
            {
                var product = new Product{
                    Title = field.Title, 
                    NavigationListUrl = field.ArticleUrl, 
                    IconPath = field.ImageUrl, 
                    Index = index,
                    Identifier = field.Title.GetHashCode().ToString(CultureInfo.CurrentUICulture)   
                };
                return product;
            }
            return null;
        }
    }
}