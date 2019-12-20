using System.Web.Mvc;
using System.Linq;

namespace Reddah.Web.UI.Controllers
{
    public enum VerifySuccessState
    {
        NotVerified,
        Success,
        UserNotExist,
        WrongToken,
        AlreadyVerified
    }

    public class VerifyEmailController : Controller
    {
        private readonly log4net.ILog log = log4net.LogManager.GetLogger("VerifyEmailController");

        public ActionResult Index(string userId, string emailToken) 
        {
            log.Info(string.Format("userId:{0}, emailToken:{1}", userId, emailToken));
            ViewBag.VerifySuccessState = VerifySuccessState.NotVerified;
            ViewBag.UserId = userId;
            ViewBag.EmailToken = emailToken;

            using (var context = new reddahEntities1())
            {
                var intUserId = -1;
                if (int.TryParse(userId, out intUserId))
                {
                    var item = context.webpages_Membership.FirstOrDefault(u => u.UserId == intUserId);
                    if (item != null)
                    {
                        if (item.IsConfirmed == true && item.ConfirmationToken.Length==23)
                        {
                            ViewBag.VerifySuccessState = VerifySuccessState.AlreadyVerified;
                        }
                        else
                        {
                            if (item.ConfirmationToken == emailToken)
                            {
                                item.ConfirmationToken = item.ConfirmationToken.Substring(0, 23);
                                item.IsConfirmed = true;
                                context.SaveChanges();
                                ViewBag.VerifySuccessState = VerifySuccessState.Success;
                            }
                            else
                            {
                                ViewBag.VerifySuccessState = VerifySuccessState.WrongToken;
                            }
                        }
                    }
                    else
                    {
                        ViewBag.VerifySuccessState = VerifySuccessState.UserNotExist;
                    }
                }
                else 
                {
                    ViewBag.VerifySuccessState = VerifySuccessState.UserNotExist;
                }
            }


            return View("~/Views/Account/VerifyEmail.cshtml");
        }        
    }
}
