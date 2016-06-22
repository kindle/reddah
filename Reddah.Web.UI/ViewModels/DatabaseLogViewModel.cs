namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Xml;
    using System.Linq;

    using Reddah.Web.UI.Models;

    public class DatabaseLogViewModel : ArticleViewModelBase
    {
        public DatabaseLogViewModel(string path)
            : base(path)
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

            using (var db = new reddahEntities1())
            {
                var query = from b in db.Logs
                            orderby b.Id descending
                            select b;

                foreach (var item in query)
                {
                    var ap = new ArticlePreview();
                    ap.Title = item.Level;
                    ap.Description = item.Id +" " + item.Date + " " +item.Message;
                    ap.ImageUrl = item.Thread;
                    ap.ArticleUrl = item.Logger;

                    apList.Add(ap);
                }

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