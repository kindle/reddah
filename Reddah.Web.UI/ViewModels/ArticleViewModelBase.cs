namespace Reddah.Web.UI.ViewModels
{
    using System.Xml;

    using Reddah.Web.UI.Models;

    public class ArticleViewModelBase : ViewModelBase
    {
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
    }
}