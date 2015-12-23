using System;
using System.Collections.Generic;
using System.Linq;

using Reddah.Web.UI.Models;

namespace Reddah.Web.UI.ViewModels.ContactSupport
{
    public class CategoriesViewModel
    {
        private readonly NavigationListViewModel navigationList;
        private readonly string navigationListPath;

        public CategoriesViewModel(string path)
        {
            this.navigationListPath = path;
            this.navigationList = new NavigationListViewModel(navigationListPath);
            this.Categories = GetCategories();
        }

        public IEnumerable<Category> Categories { get; private set; }

        private IEnumerable<Category> GetCategories()
        {
            var categories = new List<Category>();

            int index = 0;
            if (navigationList != null)
            {
                foreach (var child in navigationList.Folders)
                {
                    if (child.ArticleUrl.ToLower().Contains("navigationlist") &&
                            !categories.Any(product => product.Title.Equals(child.Title, StringComparison.InvariantCultureIgnoreCase)))
                    {
                        var category = CreateCategory(child, index);
                        if (category != null)
                        {
                            categories.Add(category);
                            index++;
                        }
                    }
                }
            }

            return categories;
        }

        private Category CreateCategory(Models.ArticlePreview field, int index)
        {
            if((field != null) && field.ArticleUrl.ToLower().Contains("navigationlist"))
            {
                var category = new Category
                               {
                                   Title = field.Title,
                                   ArticleUrl = field.ArticleUrl,
                                   //IconPath = field.ImageUrl,
                                   Index = index
                               };

                
                var child = new NavigationListViewModel(category.ArticleUrl);
                if(child.Folders.Count > 0)
                {
                    var subCategories = new List<Category>();
                    var subIndex = 0;
                    foreach (var item in child.Folders)
                    {
                        var subCategory = new Category()
                                            {
                                                Title = item.Title,
                                                ArticleUrl = item.ArticleUrl,
                                                Index = subIndex
                                            };
                        subCategories.Add(subCategory);
                        subIndex++;
                    }
                    category.Categories = subCategories;

                    return category;
                }
            }
            return null;
        }

    }
}