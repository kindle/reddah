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
using System.Web;
using System.Web.Hosting;
using System.IO;
using System.Net.Http;
using System.Collections.Specialized;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

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
        public IHttpActionResult AddTimeline()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string thoughts = HttpContext.Current.Request["thoughts"];
                string location = HttpContext.Current.Request["location"];
                List<string> imageUrls = new List<string>();

                HttpFileCollection hfc = HttpContext.Current.Request.Files;

                if (String.IsNullOrWhiteSpace(thoughts) && hfc.Count == 0)
                    return Ok(new ApiResult(1, "No thoughts and photos"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        foreach (string rfilename in HttpContext.Current.Request.Files)
                        {
                            //upload image first
                            string guid = Guid.NewGuid().ToString().Replace("-", "");
                            string uploadedImagePath = "/uploadPhoto/";
                            string uploadImageServerPath = "~" + uploadedImagePath;

                            HttpPostedFile upload = HttpContext.Current.Request.Files[rfilename];

                            try
                            {
                                var fileFormat = upload.FileName.Substring(upload.FileName.LastIndexOf('.')).Replace(".", "");
                                var fileName = Path.GetFileName(guid + "." + fileFormat);
                                var filePhysicalPath = HostingEnvironment.MapPath(uploadImageServerPath + "/" + fileName);
                                if (!Directory.Exists(HostingEnvironment.MapPath(uploadImageServerPath)))
                                {
                                    Directory.CreateDirectory(HostingEnvironment.MapPath(uploadImageServerPath));
                                }
                                upload.SaveAs(filePhysicalPath);
                                var url = uploadedImagePath + fileName;


                                UploadFile file = new UploadFile();
                                file.Guid = guid;
                                file.Format = fileFormat;
                                file.UserName = jwtResult.JwtUser.User;
                                file.CreatedOn = DateTime.Now;
                                file.GroupName = "";
                                file.Tag = "";
                                db.UploadFile.Add(file);
                                imageUrls.Add("https://login.reddah.com" + url);
                            }
                            catch (Exception ex)
                            {
                                
                            }
                        }


                        //add timeline article
                        db.Article.Add(new Article()
                        {
                            Title = thoughts,
                            Content = string.Join("$$$", imageUrls),
                            CreatedOn = DateTime.Now,
                            Count = 0,
                            GroupName = location,
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
            catch(Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }

            

        }

        [Route("getmytimeline")]
        [HttpPost]
        public IHttpActionResult GetMyTimeline()
        {
            IEnumerable<Article> query = null;
            
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                //string thoughts = HttpContext.Current.Request["thoughts"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 10;
                    
                    int[] loaded = loadedIds == null ? new int[] { } : loadedIds;
                    
                    query = (from b in db.Article
                             where b.Type == 1 && (b.UserName == jwtResult.JwtUser.User || 
                             (from f in db.UserFriend where f.UserName == jwtResult.JwtUser.User select f.Watch).ToList().Contains(b.UserName)
                             ) &&
                                     !(loaded).Contains(b.Id)
                                orderby b.Id descending
                                select b)
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("gettimeline")]
        [HttpPost]
        public IHttpActionResult GetTimeline()
        {
            IEnumerable<Article> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                //string thoughts = HttpContext.Current.Request["thoughts"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 10;

                    int[] loaded = loadedIds == null ? new int[] { } : loadedIds;

                    query = (from b in db.Article
                             where b.Type == 1 && b.UserName == targetUser &&
                                     !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select b)
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("like")]
        [HttpPost]
        public IHttpActionResult Like()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                
                string action = HttpContext.Current.Request["action"];
                int id = int.Parse(HttpContext.Current.Request["id"]);
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));
                
                using (var db = new reddahEntities())
                {

                    var article = db.Article.FirstOrDefault(a => a.Id == id);
                    if(article != null)
                    {
                        if (action.Equals("add"))
                        {
                            if (!article.GroupName.Split(',').ToList().Contains(jwtResult.JwtUser.User))
                            {
                                if(string.IsNullOrWhiteSpace(article.GroupName))
                                    article.GroupName += jwtResult.JwtUser.User;
                                else 
                                    article.GroupName += "," + jwtResult.JwtUser.User;
                            }
                            else
                                return Ok(new ApiResult(1, "already add like"));
                        }

                        if (action.Equals("remove"))
                        {
                            if (article.GroupName.Split(',').ToList().Contains(jwtResult.JwtUser.User))
                            {
                                var list = article.GroupName.Split(',').ToList();
                                list.Remove(jwtResult.JwtUser.User);
                                article.GroupName = string.Join(",", list);
                            }
                            else
                                return Ok(new ApiResult(2, "already remove like"));
                        }

                        db.SaveChanges();
                    }
                    else
                        return Ok(new ApiResult(3, "Article not found"));

                    return Ok(new ApiResult(0, "success"+ jwtResult.JwtUser.User));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

    }
}
