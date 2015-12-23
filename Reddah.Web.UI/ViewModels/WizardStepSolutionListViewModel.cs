namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Xml;

    public class WizardStepSolutionListViewModel : ArticleViewModelBase
    {
        public List<string> SolutionList { get; set; }

        public string YesText { get; set; }
        public string YesUrl { get; set; }
        public string NoText { get; set; }
        public string NoUrl { get; set; }

        public WizardStepSolutionListViewModel(string path) : base(path)
        {
            LoadCompassData();
        }

        private void LoadCompassData()
        {
            SolutionList = new List<string>();

            YesText = GetNodeInnerText(Doc.SelectSingleNode("ContentType/SolveIssue/YesText"));
            YesUrl = GetNodeInnerText(Doc.SelectSingleNode("ContentType/SolveIssue/YesUrl"));
            NoText = GetNodeInnerText(Doc.SelectSingleNode("ContentType/SolveIssue/NoText"));
            NoUrl = GetNodeInnerText(Doc.SelectSingleNode("ContentType/SolveIssue/NoUrl"));

            foreach (XmlNode node in Doc.SelectNodes("ContentType/Solutions/Solution"))
            {
                var solution = GetNodeInnerText(node);
                SolutionList.Add(solution);
            }
        }
    }
}