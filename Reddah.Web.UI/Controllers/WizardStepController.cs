using Reddah.Web.UI.Models;
using Reddah.Web.UI.ViewModels;
using System.Web.Mvc;

namespace Reddah.Web.UI.Controllers
{
    public class WizardStepController : BaseController
    {
        [HttpGet]
        public ActionResult GetWizardStep(string path, string stepIndex, string solutionIndex)
        {
            var stepType = GetContentType(path);
            var wizardStepData = new WizardStepDataViewModel(path);
            
            int number;
            wizardStepData.StepIndex = int.TryParse(stepIndex, out number) ? number : 0;
            wizardStepData.SolutionIndex = int.TryParse(solutionIndex, out number) ? number : 0;

            switch (stepType)
            {
                case "WizardStepDecision":
                    wizardStepData.LoadCompassData();
                    break;
                case "WizardStepSolutionList":
                {
                    var solutionList = new WizardStepSolutionListViewModel(path);

                    int index = 0;
                    if(wizardStepData.SolutionIndex < solutionList.SolutionList.Count)
                    {
                        index = wizardStepData.SolutionIndex;
                    }
                    var solutionPath = solutionList.SolutionList[index];
                    wizardStepData.LoadCompassData(solutionPath);

                    wizardStepData.SolveIssue = new SolveIssue
                    {
                        YesText = solutionList.YesText,
                        YesUrl = solutionList.YesUrl,
                        NoText = solutionList.NoText,
                        NoUrl = (index == solutionList.SolutionList.Count - 1) ? solutionList.NoUrl : path
                    };

                    break;
                }
                case "WizardStepEnd":
                {
                    wizardStepData.LoadCompassData();
                    break;
                }
            }

            return View("~/Views/Shared/Controls/WizardStep.cshtml", wizardStepData);
        }
    }
}
