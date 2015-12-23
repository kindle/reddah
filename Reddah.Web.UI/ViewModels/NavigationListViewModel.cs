namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Xml;

    using Reddah.Web.UI.Models;
    
    public class NavigationListViewModel : ArticleViewModelBase
    {
        public NavigationListViewModel(string path) : base(path)
        {
            Articles = GetArticlePreviews(path);
            Folders = GetFolderPreviews(path);
            Items = GetItemPreviews(path);
        }

        public List<ArticlePreview> Articles { get; set; }
        public List<ArticlePreview> Folders { get; set; }
        public List<ArticlePreview> Items { get; set; }

        private List<ArticlePreview> GetItemPreviews(string path)
        {
            var apList = new List<ArticlePreview>();

            ArticleTitle = Doc.SelectSingleNode("ContentType/Title").InnerText;

            foreach (XmlNode node in Doc.SelectNodes("ContentType/Articles/Article"))
            {
                var ap = new ArticlePreview();
                ap.Title = node.SelectSingleNode("Title").InnerText;
                ap.Description = node.SelectSingleNode("Description").InnerText;
                ap.ImageUrl = node.SelectSingleNode("ImageUrl").InnerText;
                ap.ArticleUrl = node.SelectSingleNode("ArticleUrl").InnerText;

                apList.Add(ap);
            }

            return apList;
        }

        private List<ArticlePreview> GetFolderPreviews(string path)
        {
            return GetItemPreviews(path).FindAll(url => url.ArticleUrl.ToLower().Contains("navigationlist"));
        }

        private List<ArticlePreview> GetArticlePreviews(string path)
        {
            return GetItemPreviews(path).FindAll(url => !url.ArticleUrl.ToLower().Contains("navigationlist"));
        }
    }
}