using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml;

using Reddah.Web.UI.Models;

namespace Reddah.Web.UI.ViewModels
{
    public class BrowseProductViewModel
    {
        private const int DefaultProductCategoryLimit = 4;

        public static int CategoryLimit { get; set; }
        public static string ShowMoreText { get; set; }
        public static string ShowLessText { get; set; }
        
        public string Title { get; set; }
        public string NavigationListUrl { get; set; }
        public string CompassIdentifier { get; set; }

        public List<Category> Categories { get; set; }
        public int CurrentCategoryIndex { get; set; }

        public static void GetProductSettings(string path)
        {
            var doc = new XmlDocument();
            doc.Load(HttpContext.Current.Server.MapPath("~/Content/" + path + ".xml"));

            // load limit
            int productCategoryLimit;
            var contentData = doc.SelectSingleNode("ContentType/CategoryLimit");
            if ((contentData != null) && int.TryParse(contentData.InnerText, out productCategoryLimit))
            {
                CategoryLimit = (productCategoryLimit > 0) ? productCategoryLimit : DefaultProductCategoryLimit;
            }
            else
            {
                CategoryLimit = DefaultProductCategoryLimit;
            }

            // load texts
            contentData = doc.SelectSingleNode("ContentType/ShowMoreText");
            ShowMoreText = contentData != null ? contentData.InnerText : Resources.Resources.Browse_ShowMoreText;

            contentData = doc.SelectSingleNode("ContentType/ShowLessText");
            ShowLessText = contentData != null ? contentData.InnerText : Resources.Resources.Browse_ShowLessText;
        }

        public void GetCategories(string path, string currentProductName, string currentCategoryName)
        {
            var contentData = new NavigationListViewModel(path);

            Categories = new List<Category>();
            Categories.Add(CreateTopIssuesCategory(currentProductName, currentCategoryName));

            var index = 2;
            foreach (var child in contentData.Folders)
            {
                if(child.ArticleUrl.ToLower().Contains("navigationlist") &&
                   !Categories.Any(category => category.Title.Equals(child.Title, StringComparison.InvariantCultureIgnoreCase)))
                {
                    var category = CreateCategory(child, currentCategoryName, currentCategoryName, index);
                    if(category != null)
                    {
                        Categories.Add(category);
                        index++;
                    }
                }
            }
        }

        private Category CreateCategory(ArticlePreview field, string currentProductName, string currentCategoryName, int categoryIndex)
        {
            if ((field != null) && field.ArticleUrl.ToLower().Contains("navigationlist"))
            {
                var category = new Category
                               {
                                   Title = field.Title,
                                   ArticleUrl = field.ArticleUrl.ToLower()
                               };

                var compassIdentifier = category.ArticleUrl.Replace("compass/pages/", "");
                category.CompassIdentifier = (compassIdentifier.Split('/').Length > 2)
                                        ? compassIdentifier.Split('/')[1]
                                        : compassIdentifier.Split('/')[0];

                category.Link = string.Format("?product={0}&category={1}", CompassIdentifier, category.CompassIdentifier);
                category.IsCurrent = CompassIdentifier.Contains(currentProductName) && category.CompassIdentifier.Contains(currentCategoryName);

                if(category.IsCurrent)
                {
                    CurrentCategoryIndex = categoryIndex;
                    var contentData = new NavigationListViewModel(category.ArticleUrl);
                    category.ArticlePreviews = contentData.Articles;
                }

                return category;
            }

            return null;
        }

        private Category CreateTopIssuesCategory(string currentProductName, string currentCategoryName)
        {
            var category = new Category
            {
                Title = Resources.Resources.Browse_TopIssues,
                ArticleUrl = NavigationListUrl,
                Link = string.Format("?product={0}", CompassIdentifier)
            };

            if (NavigationListUrl.Contains(currentProductName) &&
               currentCategoryName.Equals(Resources.Resources.Browse_TopIssues, StringComparison.OrdinalIgnoreCase))
            {
                category.IsCurrent = true;
                var contentData = new NavigationListViewModel(category.ArticleUrl);
                category.ArticlePreviews = contentData.Articles;
                CurrentCategoryIndex = 1;
            }

            return category;
        }
    }
}