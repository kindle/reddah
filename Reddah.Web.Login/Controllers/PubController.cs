using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using System.Web.Http.Cors;
using Reddah.Web.Login.Utilities;
using System.Web;
using System.Web.Hosting;
using System.IO;
using System.Web.Script.Serialization;
using System.Data.Entity.Validation;
using System.Text.RegularExpressions;
using WebMatrix.WebData;
using System.Net.Mail;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/pub")]
    public class PubController : ApiBaseController
    {
        /// <summary>
        /// register personal publisher account type==1
        /// </summary>
        /// <returns></returns>
        [Route("registersub")]
        public IHttpActionResult RegisterSub()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string userName = Guid.NewGuid().ToString().Replace("-", "");
                string password = Guid.NewGuid().ToString().Replace("-", "");
                string nickName = HttpContext.Current.Request["NickName"];
                string signature = HttpContext.Current.Request["Signature"];
                string email = HttpContext.Current.Request["Email"];
                string locale = HttpContext.Current.Request["Locale"];

                if (String.IsNullOrWhiteSpace(userName))
                    return Ok(new ApiResult(1, "No user name"));

                if (String.IsNullOrWhiteSpace(password))
                    return Ok(new ApiResult(1, "No password"));

                if (String.IsNullOrWhiteSpace(email))
                    return Ok(new ApiResult(1, "No email"));

                Regex reg = new Regex(@"^\w+$");//字母、数字和下划线
                //Regex reg = new Regex("^[a-zA-Z]\\w{5,17}$");//字母开头，字母、数字和下划线
                if (!reg.IsMatch(userName))
                    return Ok(new ApiResult(2, "user name invalid:" + userName));

                reg = new Regex("^\\s*([A-Za-z0-9_-]+(\\.\\w+)*@(\\w+\\.)+\\w{2,5})\\s*$");//valid email
                if (!reg.IsMatch(email))
                    return Ok(new ApiResult(2, "Email invalid"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));


                using (var db = new reddahEntities())
                {
                    var userExist = db.UserProfile.FirstOrDefault(u => u.UserName == userName || u.UserName.Contains(userName));
                    if (userExist != null)
                        return Ok(new ApiResult(3, "User exist"));

                    var nickNameExist = db.UserProfile.FirstOrDefault(u => u.NickName == nickName || u.NickName.Contains(nickName));
                    if (nickNameExist != null)
                        return Ok(new ApiResult(3, "nickname exist"));

                    //var emailExist = db.UserProfile.FirstOrDefault(u => u.Email == email);
                    //if (emailExist != null)
                    //    return Ok(new ApiResult(3, "Email exist"));

                    if (!WebSecurity.Initialized && WebApiConfig.IsWebSecurityNotCalled)
                    {
                        WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", false);
                        WebApiConfig.IsWebSecurityNotCalled = false;
                    }

                    var verifyToken = WebSecurity.CreateUserAndAccount(
                        userName,
                        password,
                        new { Email = email },
                        true);

                    var userJustCreated = db.UserProfile.FirstOrDefault(u => u.UserName == userName);
                    userJustCreated.Type = 1;
                    userJustCreated.NickName = nickName;
                    userJustCreated.Signature = signature;
                    userJustCreated.CreatedBy = jwtResult.JwtUser.User;
                    userJustCreated.Admins = jwtResult.JwtUser.User;

                    db.SaveChanges();

                    Helpers.Email(
                            new MailAddress("donotreply@reddah.com", "Reddah Public Platform Account"),
                            new MailAddress(email, userName),
                            "Verify your email address‏",
                            string.Format("Dear {0}:\r\n" +
                            "Please visit this link to verify your email address:\r\n" +
                            "https://reddah.com/{1}/VerifyEmail?Userid={2}&EmailToken={3}" +
                            "\r\nAfter that, you can update your public platform account information. Thanks for using Reddah!",
                            jwtResult.JwtUser.User, locale, userJustCreated.UserId, verifyToken)
                    );
                }

                return Ok(new ApiResult(0, ""));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getpublisher")]
        [HttpPost]
        public IHttpActionResult GetPublisher()
        {
            IEnumerable<UserProfile> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string key = HttpContext.Current.Request["key"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 10;

                    int[] loaded = loadedIds == null ? new int[] { } : loadedIds;

                    query = (from u in db.UserProfile
                             where u.Type == 1 &&
                             (u.NickName.Contains(key) || u.Signature.Contains(key))
                             && !(loaded).Contains(u.UserId)
                             orderby u.UserId
                             select u)
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        /// <summary>
        /// get subscribers list
        /// </summary>
        /// <returns></returns>
        [Route("subs")]
        [HttpPost]
        public IHttpActionResult GetSubs()
        {
            IEnumerable<UserProfile> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    query = from u in db.UserProfile
                            where u.Type == 1 && (u.CreatedBy == jwtResult.JwtUser.User ||
                                (u.Admins.StartsWith(jwtResult.JwtUser.User + ",") ||
                                        u.Admins.Contains("," + jwtResult.JwtUser.User + ",") ||
                                        u.Admins.EndsWith("," + jwtResult.JwtUser.User)))
                            orderby u.Type
                            select u;

                    return Ok(query.ToList());
                }

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }


    }
}
