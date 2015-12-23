namespace Reddah.Web.UI.Models
{
    /// <summary>
    /// Object representing an article preview.
    /// It contains a title, a description, an image url and the link to the article.
    /// </summary>
    public class ArticlePreview
    {
        /// <summary>
        /// Gets or sets the Title of the article.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Gets or sets the description of the article.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the url in string format of the image associated to the article.
        /// </summary>
        public string ImageUrl { get; set; }

        /// <summary>
        /// Gets or sets the localized url in string format of the article itself.
        /// </summary>
        public string ArticleUrl { get; set; }
    }
}