namespace Reddah.Web.UI.Models
{
    /// <summary>
    /// Object representing a product.
    /// </summary>
    public class Product
    {
        public string Title { get; set; }
        public int Index { get; set; }
        public string NavigationListUrl { get; set; }

        public string IconPath { get; set; }
        public string Identifier { get; set; }
    }
}