﻿namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Xml;
    using System.Linq;

    using Reddah.Web.UI.Models;
    
    public class DatabaseTopListViewModel : ArticleViewModelBase
    {
        public DatabaseTopListViewModel(string path)
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
                //var blog = new Labels { Name = "game" };
                //db.Labels.Add(blog);
                //db.SaveChanges();

                // Display all Blogs from the database 
                var query = from b in db.Articles
                            orderby b.Id descending
                            select b;

                foreach (var item in query)
                {
                    var ap = new ArticlePreview();
                    ap.Title = item.Title;
                    ap.Description = item.Content;
                    ap.ImageUrl = item.Title;
                    ap.ArticleUrl = item.Title;

                    apList.Add(ap);
                }

            } 


            //foreach (XmlNode node in Doc.SelectNodes("ContentType/Articles/Article"))
            //{
            //    var ap = new ArticlePreview();
            //    ap.Title = node.SelectSingleNode("Title").InnerText;
            //    ap.Description = node.SelectSingleNode("Description").InnerText;
            //    ap.ImageUrl = node.SelectSingleNode("ImageUrl").InnerText;
            //    ap.ArticleUrl = node.SelectSingleNode("ArticleUrl").InnerText;

            //    apList.Add(ap);
            //}
            //get top 25 dah from db

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