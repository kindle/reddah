namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Xml;

    using Reddah.Web.UI.Models;

    public class WizardStepDataViewModel : ArticleViewModelBase
    {
        public int StepIndex { get; set; }
        public int SolutionIndex { get; set; }
        public string LegendTitle { get; set; }
        public string Description { get; set; }
        public List<SolutionModule> SolutionModuleList { get; set; }

        public string AnswersTitle { get; set; }
        public string AnswersImageType { get; set; }
        public bool AnswersImageForcedHeight { get; set; }
        public List<ProposalModel> AnswerList { get; set; }

        public SolveIssue SolveIssue { get; set; }
        
        public WizardStepDataViewModel(string path) : base(path)
        {
        }

        public void LoadCompassData(string path)
        {
            base.Init(path);
            LoadCompassData();
        }

        public void LoadCompassData()
        {
            SolutionModuleList = new List<SolutionModule>();

            ArticleTitle = GetNodeInnerText(Doc.SelectSingleNode("ContentType/Title"));
            LegendTitle = GetNodeInnerText(Doc.SelectSingleNode("ContentType/LegendTitle"));
            Description = GetNodeInnerText(Doc.SelectSingleNode("ContentType/Description"));

            foreach (XmlNode node in Doc.SelectNodes("ContentType/Module"))
            {
                var moduleType = GetNodeInnerText(node.SelectSingleNode("ModuleType"));

                switch (moduleType)
                {
                    case "StartSectionModule":
                        var ssm = new StartSectionModule();
                        ssm.ModuleType = moduleType;
                        ssm.Text = node.SelectSingleNode("Text").InnerText;
                        SolutionModuleList.Add(ssm);
                        break;
                    case "TextModule":
                        var tm = new TextModule();
                        tm.ModuleType = moduleType;
                        tm.Text = node.SelectSingleNode("Text").InnerText;
                        SolutionModuleList.Add(tm);
                        break;
                    case "OneImageModule":
                        var oim = new OneImageModule();
                        oim.ModuleType = moduleType;
                        oim.Style = node.SelectSingleNode("Style").InnerText;
                        oim.Caption = node.SelectSingleNode("Caption").InnerText;
                        oim.ImageUrl = node.SelectSingleNode("ImageUrl").InnerText;
                        oim.Text = node.SelectSingleNode("Text").InnerText;
                        oim.ImageLink = node.SelectSingleNode("ImageLink").InnerText;
                        SolutionModuleList.Add(oim);
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
                        SolutionModuleList.Add(tim);
                        break;
                    case "OneVideoModule":
                        var ovm = new OneVideoModule();
                        ovm.ModuleType = moduleType;
                        ovm.Style = node.SelectSingleNode("Style").InnerText;
                        ovm.BackgroundImageUrl = node.SelectSingleNode("BackgroundImageUrl").InnerText;
                        ovm.Text = node.SelectSingleNode("Text").InnerText;
                        ovm.VideoUrl = node.SelectSingleNode("VideoUrl").InnerText;
                        ovm.VideoTitle = node.SelectSingleNode("VideoTitle").InnerText;
                        SolutionModuleList.Add(ovm);
                        break;
                }
                //ap.Title = node.SelectSingleNode("Title").InnerText;
                //ap.Description = node.SelectSingleNode("Description").InnerText;
                //ap.ImageUrl = node.SelectSingleNode("ImageUrl").InnerText;
                //ap.ArticleUrl = node.SelectSingleNode("ArticleUrl").InnerText;

                //smList.Add(sm);
            }


            AnswersTitle = GetNodeInnerText(Doc.SelectSingleNode("ContentType/Answers/Title"));
            AnswersImageType = GetNodeInnerText(Doc.SelectSingleNode("ContentType/Answers/ImageType"));
            AnswersImageForcedHeight = GetNodeInnerText(Doc.SelectSingleNode("ContentType/Answers/ImageForcedHeight")) == "true";

            AnswerList = new List<ProposalModel>();
            foreach (XmlNode node in Doc.SelectNodes("ContentType/Answers/Proposals/Proposal"))
            {
                var proposal = new ProposalModel
                               {
                                    Text = node.SelectSingleNode("Text").InnerText,
                                    ImageUrl = node.SelectSingleNode("ImageUrl").InnerText,
                                    StepUrl = node.SelectSingleNode("StepUrl").InnerText
                               };
                AnswerList.Add(proposal);
            }
        }
    }
}