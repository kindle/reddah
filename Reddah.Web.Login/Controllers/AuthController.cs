using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Web.Http;
using System.Linq;
using System.Web.Helpers;
using System.Security.Cryptography;
using System.Web.ApplicationServices;
using WebMatrix.WebData;
using Org.BouncyCastle.Crypto;
using System.Web.Security;
using System.Data.Entity;
using System.Web.Http.Cors;
using System.Web;
using Reddah.Web.Login.Utilities;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/auth")]
    public class AuthController : ApiBaseController
    {
        [Route("register")]
        public IHttpActionResult Register()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string userName = HttpContext.Current.Request["UserName"];
                string password = HttpContext.Current.Request["Password"];
                string email = HttpContext.Current.Request["Email"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                if (String.IsNullOrWhiteSpace(userName))
                    return Ok(new ApiResult(1, "No user name"));

                if (String.IsNullOrWhiteSpace(password))
                    return Ok(new ApiResult(1, "No password"));

                if (String.IsNullOrWhiteSpace(email))
                    return Ok(new ApiResult(1, "No email"));

                //Regex reg = new Regex(@"^\w+$");//字母、数字和下划线
                Regex reg = new Regex("^[a-zA-Z]\\w{5,17}$");//字母开头，字母、数字和下划线
                if (!reg.IsMatch(userName))
                    return Ok(new ApiResult(2, "user name invalid"));

                reg = new Regex("^\\s*([A-Za-z0-9_-]+(\\.\\w+)*@(\\w+\\.)+\\w{2,5})\\s*$");//valid email
                if (!reg.IsMatch(email))
                    return Ok(new ApiResult(2, "Email invalid"));


                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var userExist = db.UserProfile.FirstOrDefault(u => u.UserName == userName||u.UserName.Contains(userName));
                    if(userExist != null)
                        return Ok(new ApiResult(3, "User exist"));
                    //var emailExist = db.UserProfile.FirstOrDefault(u => u.Email == email);
                    //if (emailExist != null)
                    //    return Ok(new ApiResult(3, "Email exist"));

                    var verifyToken = WebSecurity.CreateUserAndAccount(
                        userName,
                        password,
                        new { Email = email },
                        false);

                    var userJustCreated = db.UserProfile.FirstOrDefault(u => u.UserName == userName);
                    Helpers.Email(
                            new MailAddress("donotreply@reddah.com", "donotreply@reddah.com"),
                            new MailAddress(email, userName),
                            "[Reddah] Verify your email address‏",
                            string.Format("Dear {0}:\r\n" +
                            "visit this link to verify your email address:\r\n" +
                            "http://www.reddah.com/en-US/VerifyEmail?Userid={1}&EmailToken={2}" +
                            "\r\nthanks for using the site!",
                            userName, userJustCreated.UserId, verifyToken)
                    );
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
                if (!WebSecurity.Initialized)
                    WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", false);

                if (Membership.ValidateUser(user.UserName, user.Password))
                {
                    var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
                    var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

                    var claims = new List<Claim>();
                    claims.Add(new Claim("100", "view"));
                    claims.Add(new Claim("101", "post"));

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
                    return Ok(new ApiResult(2, "Username or Password is wrong"));
                }
            }
            catch (Exception e)
            {
                return Ok(new ApiResult(3, e.Message.ToString()));
            }
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
    }
}
