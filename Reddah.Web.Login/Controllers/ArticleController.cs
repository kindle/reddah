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
using Reddah.Web.Login.Utilities;

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

        [Route("addcomments")]
        [HttpPost]
        public IHttpActionResult AddComments([FromBody]NewComment data)
        {
            if (data.ArticleId < 0)
                return Ok(new ApiResult(1, "Invalid Article Id"));

            JwtResult jwtResult = AuthController.ValidJwt(data.Jwt);

            if(jwtResult.Success!=0)
                return Ok(new ApiResult(2, "Jwt invalid"+jwtResult.Message));

            try
            {
                using (var db = new reddahEntities())
                {
                    db.Comment.Add(new Comment()
                    {
                        ArticleId = data.ArticleId,
                        ParentId = data.ParentId,
                        Content = System.Web.HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(data.Content))),
                        CreatedOn = DateTime.Now,
                        UserName = jwtResult.JwtUser.User
                    });


                    var article = db.Article.FirstOrDefault(a => a.Id == data.ArticleId);
                    if (article != null)
                    {
                        article.Count++;
                    }

                    if (data.ParentId != -1)
                    {
                        var parentComment = db.Comment.FirstOrDefault(c => c.Id == data.ParentId);
                        if (parentComment != null)
                        {
                            parentComment.Count++;
                        }
                    }

                    db.SaveChanges();

                }
            }
            catch(Exception ex)
            {
                Ok(new ApiResult(3, "Excepion:"+ex.Message.ToString()));
            }

            return Ok(new ApiResult(0, "New Comment Added"));

        }

        [Route("addtimeline")]
        [HttpPost]
        public IHttpActionResult AddTimeline([FromBody]NewTimeline data)
        {
            if (String.IsNullOrWhiteSpace(data.Thoughts)&& String.IsNullOrWhiteSpace(data.Content))
                return Ok(new ApiResult(1, "No thoughts and photos"));

            JwtResult jwtResult = AuthController.ValidJwt(data.Jwt);

            if (jwtResult.Success != 0)
                return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

            try
            {
                using (var db = new reddahEntities())
                {
                    db.Article.Add(new Article()
                    {
                        Title = data.Thoughts,
                        Content = data.Content,
                        CreatedOn = DateTime.Now,
                        Count=0,
                        GroupName = data.Location,
                        UserName = jwtResult.JwtUser.User,
                        Type = 1,
                    });

                    db.SaveChanges();

                }
            }
            catch (Exception ex)
            {
                Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
            }

            return Ok(new ApiResult(0, "New Timeline Added"));

        }


    }
}
