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

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/auth")]
    public class AuthController : ApiController
    {
        public const string SecretKey = "abc1234567@reddahcom";

        [Route("sign")]
        public IHttpActionResult Sign([FromBody]UserModel user)
        {
            if (user == null)
            {
                return BadRequest("Invalid client request");
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
                        expires: DateTime.Now.AddMinutes(20),
                        signingCredentials: signinCredentials
                    );

                    var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);
                    return Ok(new { Token = tokenString });
                }
                else
                {
                    return Unauthorized();
                }
            }
            catch (Exception e)
            {
                return Ok(new { Token = e.Message.ToString() });
            }
        }
       

        [Route("verify")]
        [HttpPost]
        public IHttpActionResult Verify([FromBody]Product product)
        {
            //string signedAndEncodedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIxMDAiOiJ2aWV3IiwiMTAxIjoicG9zdCIsImV4cCI6MTU1MTM5NjE5MiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5yZWRkYWguY29tIiwiYXVkIjoid2luZCJ9.bqVbbDRbw1o_bS0AZiU5hdb4EcBREoqzw1o-8zd3TrE";
            
            //expired:
            //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIxMDAiOiJ2aWV3IiwiMTAxIjoicG9zdCIsImV4cCI6MTU1MTM5NTExMywiaXNzIjoiaHR0cHM6Ly9sb2dpbi5yZWRkYWguY29tIiwiYXVkIjoiam9obmRvZSJ9.SXayamY0LV_tptXLnW7Onjd5hSrvoRQM2JAPlIGrHBc

            string signedAndEncodedToken = product.Name;
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));

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

            SecurityToken validatedToken;
            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                tokenHandler.ValidateToken(signedAndEncodedToken, tokenValidationParameters, out validatedToken);
            }
            catch(Exception ex)
            {
                return Ok(new { Result = "Invalid Signature:" + ex.Message.ToString() });
            }

            return Ok(new { Result = validatedToken.ToString() });
        }
    }
}
