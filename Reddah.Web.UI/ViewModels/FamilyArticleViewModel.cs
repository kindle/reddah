namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Xml;

    using Reddah.Web.UI.Models;

    public class FamilyArticleViewModel : ArticleViewModelBase
    {
        public FamilyArticleViewModel(string path) : base(path)
        {
            ModuleList = GetModuleList(path);
        }

        public List<FamilyArticleGroupContent> ModuleList { get; set; }

        private List<FamilyArticleGroupContent> GetModuleList(string path)
        {
            ArticleTitle = Doc.SelectSingleNode("ContentType/Title").InnerText;

            var familyGroupContainer = new List<FamilyArticleGroupContent>();

            foreach (XmlNode groupContent in Doc.SelectNodes("ContentType/FamilyGroupContainer/FamilyGroupContent"))
            {
                var familyArticleGroupContent = new FamilyArticleGroupContent();
                familyArticleGroupContent.Title = groupContent.SelectSingleNode("Title").InnerText;

                familyArticleGroupContent.FamilySubArticleGroups = new List<FamilySubArticleGroupContent>();

                foreach (XmlNode subGroupContent in groupContent.SelectNodes("FamilySubGroupContent"))
                {
                    var familySubGroupContent = new FamilySubArticleGroupContent();
                    familySubGroupContent.Title = subGroupContent.SelectSingleNode("Title").InnerText;

                    familySubGroupContent.FamilySubArticleGroupContentLinks = new List<FamilySubArticleGroupContentLink>();
                    foreach (XmlNode subGroupContentLink in subGroupContent.SelectNodes("FamilySubGroupContentLink"))
                    {
                        var familySubArticleGroupContentLink = new FamilySubArticleGroupContentLink();
                        familySubArticleGroupContentLink.Title = subGroupContentLink.SelectSingleNode("Title").InnerText;
                        familySubArticleGroupContentLink.ImageUrl = subGroupContentLink.SelectSingleNode("ImageUrl").InnerText;
                        familySubArticleGroupContentLink.ArticleUrl = subGroupContentLink.SelectSingleNode("ArticleUrl").InnerText;
                        familySubArticleGroupContentLink.Description = subGroupContentLink.SelectSingleNode("Description").InnerText;
                        familySubGroupContent.FamilySubArticleGroupContentLinks.Add(familySubArticleGroupContentLink);
                    }

                    familyArticleGroupContent.FamilySubArticleGroups.Add(familySubGroupContent);
                }

                familyGroupContainer.Add(familyArticleGroupContent);
            }

            return familyGroupContainer;
        }
    }
}