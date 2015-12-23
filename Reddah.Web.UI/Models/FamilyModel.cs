namespace Reddah.Web.UI.Models
{
    using System.Collections.Generic;

    public class FamilyArticleGroupContent
    {
        public string Title { get; set; }
        public List<FamilySubArticleGroupContent> FamilySubArticleGroups { get; set; }
    }

    public class FamilySubArticleGroupContent
    {
        public string Title { get; set; }
        public List<FamilySubArticleGroupContentLink> FamilySubArticleGroupContentLinks { get; set; }
    }

    public class FamilySubArticleGroupContentLink
    {
        public string Title { get; set; }
        public string ImageUrl { get; set; }
        public string ArticleUrl { get; set; }
        public string Description { get; set; }
    }
}