using System.Web.Mvc;
using System.Linq;
using System;

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
                        if (item.IsConfirmed == true && item.ConfirmationToken!=null &&item.ConfirmationToken.Length==23)
                        {
                            ViewBag.VerifySuccessState = VerifySuccessState.AlreadyVerified;
                        }
                        else
                        {
                            if (item.ConfirmationToken == emailToken)
                            {
                                var target = context.UserProfiles.FirstOrDefault(u => u.UserId == intUserId);
                                //award point for first time to verify email
                                var gotPointBefore = context.Points.FirstOrDefault(p => p.To == target.UserName && p.Reason == "email");
                                if (gotPointBefore == null)
                                {
                                    int awardPoint = 10;
                                    var point = new Point()
                                    {
                                        CreatedOn = DateTime.UtcNow,
                                        From = "Reddah",
                                        To = target.UserName,
                                        OldV = target.Point,
                                        V = awardPoint,
                                        NewV = target.Point + awardPoint,
                                        Reason = "email"
                                    };
                                    context.Points.Add(point);
                                    target.Point = target.Point + awardPoint;
                                }

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
