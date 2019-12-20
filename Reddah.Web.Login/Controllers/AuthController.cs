using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Web.Http;
using System.Linq;
using WebMatrix.WebData;
using System.Web.Security;
using System.Web;
using Reddah.Web.Login.Utilities;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/auth")]
    public class AuthController : ApiBaseController
    {
        /// <summary>
        /// register normal personal account type==0
        /// </summary>
        /// <returns></returns>
        [Route("register")]
        public IHttpActionResult Register()
        {
            try
            {
                string userName = HttpContext.Current.Request["UserName"];
                string password = HttpContext.Current.Request["Password"];
                string email = HttpContext.Current.Request["Email"];
                string locale = HttpContext.Current.Request["Locale"];

                string emailTitle = HttpContext.Current.Request["MailTitle"];
                string emailSub = HttpContext.Current.Request["MailSub"];
                string emailParaStart = HttpContext.Current.Request["MailParaStart"];
                string emailParaEnd = HttpContext.Current.Request["MailParaEnd"];

                if (String.IsNullOrWhiteSpace(userName))
                    return Ok(new ApiResult(1, "No user name"));

                if (String.IsNullOrWhiteSpace(password))
                    return Ok(new ApiResult(1, "No password"));

                if (String.IsNullOrWhiteSpace(email))
                    return Ok(new ApiResult(1, "No email"));

                //Regex reg = new Regex(@"^\w+$");//字母、数字和下划线
                Regex reg = new Regex("^[a-zA-Z0-9]\\w{5,17}$");//字母、数字
                if (!reg.IsMatch(userName))
                    return Ok(new ApiResult(1001, "user name invalid"));

                reg = new Regex("^\\s*([A-Za-z0-9_-]+(\\.\\w+)*@(\\w+\\.)+\\w{2,5})\\s*$");//valid email
                if (!reg.IsMatch(email))
                    return Ok(new ApiResult(1002, "Email invalid"));

                using (var db = new reddahEntities())
                {
                    var userExist = db.UserProfile.FirstOrDefault(u => u.UserName == userName||u.UserName.Contains(userName));
                    if(userExist != null)
                        return Ok(new ApiResult(1003, "User exist"));

                    List<string> testEmail = new List<string>();
                    testEmail.Add("weibailin@hotmail.com");
                    //only test email can register multi-times
                    if (!testEmail.Contains(email))
                    {
                        var emailExist = db.UserProfile.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
                        if (emailExist != null)
                            return Ok(new ApiResult(1004, "Email already registered"));
                    }
                    

                    if (!WebSecurity.Initialized && WebApiConfig.IsWebSecurityNotCalled)
                    {
                        WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", false);
                        WebApiConfig.IsWebSecurityNotCalled = false;
                    }

                    var verifyToken = WebSecurity.CreateUserAndAccount(
                        userName,
                        password,
                        new { Email = email },
                        false);
                }

                return Ok(new ApiResult(0, ""));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("verifyemail")]
        public IHttpActionResult VeifyEmail()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                string locale = HttpContext.Current.Request["Locale"];
                string emailTitle = HttpContext.Current.Request["MailTitle"];
                string emailSub = HttpContext.Current.Request["MailSub"];
                string emailParaStart = HttpContext.Current.Request["MailParaStart"];
                string emailParaEnd = HttpContext.Current.Request["MailParaEnd"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var verifyToken = Guid.NewGuid().ToString().Replace("-","");
                    var userToVerify = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                    var userm = db.webpages_Membership.FirstOrDefault(m => m.UserId == userToVerify.UserId);
                    userm.ConfirmationToken = verifyToken;
                    db.SaveChanges();

                    Helpers.Email(
                        new MailAddress("donotreply@reddah.com", emailTitle),
                        new MailAddress(userToVerify.Email, jwtResult.JwtUser.User),
                        emailSub,
                        string.Format("Hi {0}!<br><br>" +
                        emailParaStart + ":<br><br>" +
                        "https://reddah.com/{1}/VerifyEmail?Userid={2}&EmailToken={3}" +
                        "<br><br>" + emailParaEnd,
                        jwtResult.JwtUser.User, locale, userToVerify.UserId, verifyToken),
                        true
                    );

                    return Ok(new ApiResult(0, ""));
                }

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        /// <summary>
        /// register normal personal account type==0
        /// </summary>
        /// <returns></returns>
        [Route("checkusername")]
        public IHttpActionResult CheckUserName()
        {
            try
            {
                string userName = HttpContext.Current.Request["UserName"];
                
                if (String.IsNullOrWhiteSpace(userName))
                    return Ok(new ApiResult(1, "No user name"));

                //Regex reg = new Regex(@"^\w+$");//字母、数字和下划线
                Regex reg = new Regex("^[a-zA-Z0-9]\\w{5,17}$");//字母、数字
                if (!reg.IsMatch(userName))
                    return Ok(new ApiResult(1001, "user name invalid"));

                using (var db = new reddahEntities())
                {
                    var userExist = db.UserProfile.FirstOrDefault(u => u.UserName == userName || u.UserName.Contains(userName));
                    if (userExist != null)
                        return Ok(new ApiResult(1003, "User exist"));
                }

                return Ok(new ApiResult(0, ""));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }


        [Route("sign")]
        public IHttpActionResult Sign([FromBody]UserModel user)
        {
            if (user == null)
            {
                return Ok(new ApiResult(1, "Input user name or password is empty"));
            }

            try
            {
                if (!WebSecurity.Initialized && WebApiConfig.IsWebSecurityNotCalled)
                {
                    WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", false);
                    WebApiConfig.IsWebSecurityNotCalled = false;
                }

                if (Membership.ValidateUser(user.UserName, user.Password))
                //if(WebSecurity.Login(user.UserName, user.Password))
                {
                    var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
                    var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

                    var claims = GetPermissionClaims(user.UserName);
                        //= new List<Claim>();
                    //claims.Add(new Claim("100", "view"));
                    //claims.Add(new Claim("101", "post"));

                    var tokeOptions = new JwtSecurityToken(
                        issuer: "https://login.reddah.com",
                        audience: user.UserName,
                        claims: claims,
                        //expires: DateTime.Now.AddMinutes(20),
                        expires: DateTime.Now.AddMonths(1),
                        signingCredentials: signinCredentials
                    );

                    var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);
                    return Ok(new ApiResult(0, tokenString));
                }
                else
                {
                    using (var db = new reddahEntities())
                    {
                        var userExist = db.UserProfile.FirstOrDefault(u => u.UserName == user.UserName && u.Type==0);
                        if (userExist != null)
                        {
                            var mem = db.webpages_Membership.FirstOrDefault(m => m.UserId == userExist.UserId);
                            if (mem != null)
                            {
                                if (mem.IsConfirmed!=true)
                                {
                                    return Ok(new ApiResult(1005, "email not verified"));
                                }
                            }
                        }
                    }

                    return Ok(new ApiResult(1006, "Username or Password is wrong"));
                }
            }
            catch (Exception e)
            {
                return Ok(new ApiResult(4, e.Message.ToString()));
            }
        }

        private List<Claim> GetPermissionClaims(string userName)
        {
            var list = new List<Claim>();
            using (var db = new reddahEntities())
            {
                var user = db.UserProfile.FirstOrDefault(u => u.UserName == userName);
                if (user!=null)
                {
                    var query = (from ur in db.webpages_UsersInRoles
                                 join pr in db.webpages_PrivilegesInRoles on ur.RoleId equals pr.RoleId
                                 where ur.UserId == user.UserId
                                 select pr.PrivilegeId);
                    foreach(int privilegeId in query.ToList())
                    {
                        list.Add(new Claim(privilegeId.ToString(), "PrivilegeId"));
                    }
                }
            }
            return list;
        }

        [Route("verify")]
        [HttpPost]
        public IHttpActionResult Verify([FromBody]CommentQuery product)
        {
            //string signedAndEncodedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIxMDAiOiJ2aWV3IiwiMTAxIjoicG9zdCIsImV4cCI6MTU1MTM5NjE5MiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5yZWRkYWguY29tIiwiYXVkIjoid2luZCJ9.bqVbbDRbw1o_bS0AZiU5hdb4EcBREoqzw1o-8zd3TrE";

            //expired:
            //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIxMDAiOiJ2aWV3IiwiMTAxIjoicG9zdCIsImV4cCI6MTU1MTM5NTExMywiaXNzIjoiaHR0cHM6Ly9sb2dpbi5yZWRkYWguY29tIiwiYXVkIjoiam9obmRvZSJ9.SXayamY0LV_tptXLnW7Onjd5hSrvoRQM2JAPlIGrHBc

            SecurityToken validatedToken;
            //CustomJwtSecurityToken output;

            string signedAndEncodedToken = product.Jwt;
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
            try
            {
                var tokenValidationParameters = new TokenValidationParameters
                {
                    RequireExpirationTime = true,
                    RequireSignedTokens = true,
                    ValidateAudience = false,
                    ValidateIssuer = true,
                    ValidIssuers = new string[]
                    {
                        "https://login.reddah.com",
                        "http://my.othertokenissuer.com"
                    },
                    ValidateLifetime = true,

                    IssuerSigningKey = signingKey
                };

                
                var tokenHandler = new CustomJwtSecurityTokenHandler();
            
                tokenHandler.ValidateToken(signedAndEncodedToken, tokenValidationParameters, out validatedToken);
                //output =  tokenHandler.ReadJwtToken(signedAndEncodedToken);
                return Ok(new { Result = (validatedToken as CustomJwtSecurityToken).Payload });
            }
            catch(Exception ex)
            {
                return Ok(new { Result = "Invalid Signature:" + ex.Message.ToString() });
            }

        }

        public static JwtResult ValidJwt(string jwt)
        {
            var jwtUser = new JwtUser();

            SecurityToken validatedToken;
            string signedAndEncodedToken = jwt;

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
            try
            {
                var tokenValidationParameters = new TokenValidationParameters
                {
                    RequireExpirationTime = true,
                    RequireSignedTokens = true,
                    ValidateAudience = false,
                    ValidateIssuer = true,
                    ValidIssuers = new string[]
                    {
                        "https://login.reddah.com",
                        "http://my.othertokenissuer.com"
                    },
                    ValidateLifetime = true,

                    IssuerSigningKey = signingKey
                };


                var tokenHandler = new CustomJwtSecurityTokenHandler();

                tokenHandler.ValidateToken(signedAndEncodedToken, tokenValidationParameters, out validatedToken);

                var payload = (validatedToken as CustomJwtSecurityToken).Payload;
                jwtUser.User = payload.Aud.First().ToString();
                jwtUser.Allow = "not set";

            }
            catch (Exception ex)
            {
                new JwtResult(1, ex.Message.ToString(), null);
            }



            return new JwtResult(0, "Success", jwtUser);
        }

        [Route("generatetoken")]
        public IHttpActionResult GenerateToken()
        {
            try
            {
                string email = HttpContext.Current.Request["Email"];

                string emailTitle = HttpContext.Current.Request["MailTitle"];
                string emailSub = HttpContext.Current.Request["MailSub"];
                string emailParaStart = HttpContext.Current.Request["MailParaStart"];
                string emailParaEnd = HttpContext.Current.Request["MailParaEnd"];

                if (string.IsNullOrEmpty(email))
                    return Ok(new ApiResult(2, "Empty email"));

                using (var db = new reddahEntities())
                {
                    var target = db.UserProfile.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));

                    if (target != null)
                    {
                        if (!WebSecurity.Initialized && WebApiConfig.IsWebSecurityNotCalled)
                        {
                            WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", false);
                            WebApiConfig.IsWebSecurityNotCalled = false;
                        }

                        string token = WebSecurity.GeneratePasswordResetToken(target.UserName, 1440);
                        Helpers.Email(
                                new MailAddress("donotreply@reddah.com", emailTitle),
                                new MailAddress(email, target.UserName),
                                emailSub,
                                string.Format("{0}:<br>" +
                                emailParaStart+ ":<br>" +
                                "<span style='font-weight:bold;'>{1}</span>" +
                                "<br>" + emailParaEnd,
                                target.UserName, token),
                                true
                        );
                        return Ok(new ApiResult(0, "Success"));
                    }

                    return Ok(new ApiResult(1007, "Email not registered"));
                }


            }
            catch (Exception e)
            {
                return Ok(new ApiResult(4, e.Message.ToString()));
            }
        }

        [Route("resetpassword")]
        public IHttpActionResult ResetPassword()
        {
            try
            {
                string token = HttpContext.Current.Request["Token"];
                string password = HttpContext.Current.Request["Password"];

                if (string.IsNullOrEmpty(token))
                    return Ok(new ApiResult(2, "Token Empty"));

                if (string.IsNullOrEmpty(password))
                    return Ok(new ApiResult(2, "Password Empty"));

                
                if (!WebSecurity.Initialized && WebApiConfig.IsWebSecurityNotCalled)
                {
                    WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", false);
                    WebApiConfig.IsWebSecurityNotCalled = false;
                }

                bool result = WebSecurity.ResetPassword(token, password);
                if(result)
                    return Ok(new ApiResult(0, "Success"));
                else
                    return Ok(new ApiResult(1008, "Failed"));


            }
            catch (Exception e)
            {
                return Ok(new ApiResult(4, e.Message.ToString()));
            }
        }


        [Route("changepassword")]
        public IHttpActionResult ChangePassword()
        {

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                string oldPassword = HttpContext.Current.Request["OldPassword"];
                string newPassword = HttpContext.Current.Request["NewPassword"];

                JwtResult jwtResult = ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                if (string.IsNullOrEmpty(oldPassword))
                    return Ok(new ApiResult(2, "Empty old password"));

                if (string.IsNullOrEmpty(newPassword))
                    return Ok(new ApiResult(2, "Empty new password"));

                if (!WebSecurity.Initialized && WebApiConfig.IsWebSecurityNotCalled)
                {
                    WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", false);
                    WebApiConfig.IsWebSecurityNotCalled = false;
                }

                if (Membership.ValidateUser(jwtResult.JwtUser.User, oldPassword))
                {
                    Membership.GetUser(jwtResult.JwtUser.User).ChangePassword(oldPassword, newPassword);
                    //changePasswordSucceeded = WebSecurity.ChangePassword(User.Identity.Name, model.OldPassword, model.NewPassword);
                    return Ok(new ApiResult(0, "Success"));
                }
                else
                {
                    return Ok(new ApiResult(1009, "Old Password is wrong"));
                }
            }
            catch (Exception e)
            {
                return Ok(new ApiResult(4, e.Message.ToString()));
            }
        }
    }
}
