namespace Reddah.Web.UI.Models
{
    using System.Collections.Generic;

    /// <summary>
    /// Object representing an section preview.
    /// It contains a title and list of articles
    /// </summary>
    public class SectionPreview
    {
        /// <summary>
        /// Gets or sets the Title of the section.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Gets or sets the article list.
        /// </summary>
        public List<ArticlePreview> Items { get; set; }
    }
}