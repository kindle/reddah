using System.Collections.Generic;

namespace Reddah.Web.UI.Models
{
    /// <summary>
    /// Object representing a category.
    /// </summary>
    public class Category
    {
        public string Title { get; set; }
        public string ArticleUrl { get; set; }
        public string CompassIdentifier { get; set; }
        public int Index { get; set; }

        public string Link { get; set; }
        public bool IsCurrent { get; set; }

        public List<ArticlePreview> ArticlePreviews { get; set; }

        // sub categories
        public List<Category> Categories { get; set; } 
    }
}