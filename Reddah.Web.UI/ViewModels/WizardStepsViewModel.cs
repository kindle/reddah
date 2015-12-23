namespace Reddah.Web.UI.ViewModels
{
    using System.Web;
    using System.Xml;

    public class WizardStepsViewModel : ArticleViewModelBase
    {
        public WizardStepsViewModel(string path) : base(path)
        {
            ArticleTitle = Doc.SelectSingleNode("ContentType/Title").InnerText;
            FirstStepUrl = Doc.SelectSingleNode("ContentType/FirstStepUrl").InnerText;
        }

        public string FirstStepUrl { get; set; }
    }
}