namespace Reddah.Web.UI.ViewModels
{
    using System.Xml;

    using Reddah.Web.UI.Models;
    using System.Collections.Generic;

    public class ArticleViewModelBase : ViewModelBase
    {
        public List<ArticlePreview> RightBoxModules { get; set; }
        public List<ArticlePreview> NextPrevBox { get; set; }
        public List<string> TrendingSubs { get; set; }

        public ArticleViewModelBase()
        {
            RightBoxModules = GetRightBoxArticlePreviews();
        }

        public ArticleViewModelBase(string path) : base(path)
        {
            Deflection = GetDeflectionModule();
        }

        public string ArticleTitle;

        public DeflectionModule Deflection { get; set; }

        private DeflectionModule GetDeflectionModule()
        {
            Deflection = new DeflectionModule();
            Deflection.Visible = true;

            var deflectionModuleNode = Doc.SelectSingleNode("ContentType/DeflectionModule");
            if (deflectionModuleNode == null)
            {
                Deflection.Visible = false;
            }
            else
            {
                if (GetNodeInnerText(Doc.SelectSingleNode("ContentType/DeflectionModule/Visible")).Equals("False"))
                {
                    Deflection.Visible = false;
                }
            }

            if (Deflection.Visible)
            {
                Deflection.Id = GetNodeInnerText(Doc.SelectSingleNode("ContentType/DeflectionModule/Id"));
                Deflection.Title = GetNodeInnerText(Doc.SelectSingleNode("ContentType/DeflectionModule/Title"));
                Deflection.Type = GetNodeInnerText(Doc.SelectSingleNode("ContentType/DeflectionModule/Type"));
                Deflection.ButtonText = GetNodeInnerText(Doc.SelectSingleNode("ContentType/DeflectionModule/ButtonText"));
                Deflection.ButtonLink = GetNodeInnerText(Doc.SelectSingleNode("ContentType/DeflectionModule/ButtonLink"));
                Deflection.Description = GetNodeInnerText(Doc.SelectSingleNode("ContentType/DeflectionModule/Description"));

                foreach (XmlNode article in Doc.SelectNodes("ContentType/DeflectionModule/Articles/Article"))
                {
                    var articleTitle = GetNodeInnerText(article.SelectSingleNode("Title"));
                    var articleLink = GetNodeInnerText(article.SelectSingleNode("Link"));
                    Deflection.Articles.Add(articleTitle, articleLink);
                }
            }

            return Deflection;
        }

        protected List<ArticlePreview> GetRightBoxArticlePreviews()
        {
            var rbList = new List<ArticlePreview>();

            var rb = new ArticlePreview();
            rb.Title = Resources.Resources.Right_Feedbacks;
            rb.Description = Resources.Resources.Right_Feedbacks_Desc;
            rb.ImageUrl = "/content/images/forum.png";
            rb.ArticleUrl = "r/feedbacks";
            rbList.Add(rb);

            rb = new ArticlePreview();
            rb.Title = Resources.Resources.Right_DiscussAd;
            rb.Description = Resources.Resources.Right_DiscussAd_Desc;
            rb.ImageUrl = "/content/images/ambassador.png";
            rb.ArticleUrl = "r/discuss-on-AD";
            rbList.Add(rb);

            rb = new ArticlePreview();
            rb.Title = Resources.Resources.Right_ContactUs;
            rb.Description = Resources.Resources.Right_ContactUs_Desc;
            rb.ImageUrl = "/content/images/contact_us.png";
            rb.ArticleUrl = "r/contact-us";
            rbList.Add(rb);

            return rbList;
        }
    }
}