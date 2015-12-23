namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Web;
    using System.Xml;

    using Reddah.Web.UI.Models;

    public class SolutionArticleViewModel : ArticleViewModelBase
    {
        public SolutionArticleViewModel(string path) : base(path)
        {
            SolutionModuleList = GetSolutionModuleList(path);
        }

        public List<SolutionModule> SolutionModuleList { get; set; }

        private List<SolutionModule> GetSolutionModuleList(string path)
        {
            var smList = new List<SolutionModule>();

            ArticleTitle = Doc.SelectSingleNode("ContentType/Title").InnerText;

            foreach (XmlNode node in Doc.SelectNodes("ContentType/Module"))
            {
                var moduleType = node.SelectSingleNode("ModuleType").InnerText;

                switch (moduleType)
                {
                    case "StartSectionModule":
                        var ssm = new StartSectionModule();
                        ssm.ModuleType = moduleType;
                        ssm.Text = node.SelectSingleNode("Text").InnerText;
                        smList.Add(ssm);
                        break;
                    case "TextModule":
                        var tm = new TextModule();
                        tm.ModuleType = moduleType;
                        tm.Text = node.SelectSingleNode("Text").InnerText;
                        smList.Add(tm);
                        break;
                    case "OneImageModule":
                        var oim = new OneImageModule();
                        oim.ModuleType = moduleType;
                        oim.Style = node.SelectSingleNode("Style").InnerText;
                        oim.Caption = node.SelectSingleNode("Caption").InnerText;
                        oim.ImageUrl = node.SelectSingleNode("ImageUrl").InnerText;
                        oim.Text = node.SelectSingleNode("Text").InnerText;
                        oim.ImageLink = node.SelectSingleNode("ImageLink").InnerText;
                        smList.Add(oim);
                        break;
                    case "TwoImagesModule":
                        var tim = new TwoImagesModule();
                        tim.ModuleType = moduleType;
                        tim.ImageUrl1 = node.SelectSingleNode("ImageUrl1").InnerText;
                        tim.ImageUrl2 = node.SelectSingleNode("ImageUrl2").InnerText;
                        tim.Caption1 = node.SelectSingleNode("Caption1").InnerText;
                        tim.Caption2 = node.SelectSingleNode("Caption2").InnerText;
                        tim.ImageUrl1 = node.SelectSingleNode("ImageUrl1").InnerText;
                        tim.ImageUrl2 = node.SelectSingleNode("ImageUrl2").InnerText;
                        smList.Add(tim);
                        break;
                    case "OneVideoModule":
                        var ovm = new OneVideoModule();
                        ovm.ModuleType = moduleType;
                        ovm.Style = node.SelectSingleNode("Style").InnerText;
                        ovm.BackgroundImageUrl = node.SelectSingleNode("BackgroundImageUrl").InnerText;
                        ovm.Text = node.SelectSingleNode("Text").InnerText;
                        ovm.VideoUrl = node.SelectSingleNode("VideoUrl").InnerText;
                        ovm.VideoTitle = node.SelectSingleNode("VideoTitle").InnerText;
                        smList.Add(ovm);
                        break;
                }
                //ap.Title = node.SelectSingleNode("Title").InnerText;
                //ap.Description = node.SelectSingleNode("Description").InnerText;
                //ap.ImageUrl = node.SelectSingleNode("ImageUrl").InnerText;
                //ap.ArticleUrl = node.SelectSingleNode("ArticleUrl").InnerText;

                //smList.Add(sm);
            }

            return smList;
        }
    }
}