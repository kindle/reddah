using System.Xml;
using System.Web.Mvc;
using System.Globalization;
using System.Web.Security;

namespace Reddah.Web.UI.Controllers
{
    public class BaseController : Controller
    {
        protected string GetContentType(string path)
        {
            var doc = new XmlDocument();

            var locale = CultureInfo.CurrentUICulture.Name;
            if (!System.IO.File.Exists(HttpContext.Server.MapPath("~/App_Data/" + path + "." + locale + ".xml")))
            {
                doc.Load(HttpContext.Server.MapPath("~/App_Data/" + path + ".xml"));
            }
            else 
            {
                doc.Load(HttpContext.Server.MapPath("~/App_Data/" + path + "." + locale + ".xml"));
            }

            return doc.SelectSingleNode("ContentType/@Name").Value;
        }

        protected static string ErrorCodeToString(MembershipCreateStatus createStatus)
        {
            // See http://go.microsoft.com/fwlink/?LinkID=177550 for
            // a full list of status codes.
            switch (createStatus)
            {
                case MembershipCreateStatus.DuplicateUserName:
                    return "User name already exists. Please enter a different user name.";

                case MembershipCreateStatus.DuplicateEmail:
                    return "A user name for that e-mail address already exists. Please enter a different e-mail address.";

                case MembershipCreateStatus.InvalidPassword:
                    return "The password provided is invalid. Please enter a valid password value.";

                case MembershipCreateStatus.InvalidEmail:
                    return "The e-mail address provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidAnswer:
                    return "The password retrieval answer provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidQuestion:
                    return "The password retrieval question provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidUserName:
                    return "The user name provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.ProviderError:
                    return "The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

                case MembershipCreateStatus.UserRejected:
                    return "The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

                default:
                    return "An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.";
            }
        }
    }
}
