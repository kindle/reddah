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

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/article")]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ArticleController : ApiController
    {
        public const string SecretKey = "abc1234567@reddahcom";

        [Route("getcomments")]
        [HttpPost]
        public IHttpActionResult GetComments([FromBody]CommentQuery query)
        {
            //string signedAndEncodedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIxMDAiOiJ2aWV3IiwiMTAxIjoicG9zdCIsImV4cCI6MTU1MTM5NjE5MiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5yZWRkYWguY29tIiwiYXVkIjoid2luZCJ9.bqVbbDRbw1o_bS0AZiU5hdb4EcBREoqzw1o-8zd3TrE";

            //expired:
            //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIxMDAiOiJ2aWV3IiwiMTAxIjoicG9zdCIsImV4cCI6MTU1MTM5NTExMywiaXNzIjoiaHR0cHM6Ly9sb2dpbi5yZWRkYWguY29tIiwiYXVkIjoiam9obmRvZSJ9.SXayamY0LV_tptXLnW7Onjd5hSrvoRQM2JAPlIGrHBc
            SeededComments seededComments;
            using (var db = new reddahEntities())
            {
                var comments = (from c in db.Comment
                                where c.ArticleId == query.ArticleId
                                orderby c.CreatedOn ascending
                                select c);

                seededComments = new SeededComments { Seed = -1, Comments = comments.ToList() };
                
            }
            return Ok(seededComments);

        }

        public static JwtUser ValidJwt(string jwt)
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
                jwtUser.User = payload.Aud.ToString();
                jwtUser.Allow = "not set";

            }
            catch (Exception ex)
            {
                
            }

            

            return jwtUser;
        }
    }
}
