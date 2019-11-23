using System;
using System.Collections.Generic;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using Reddah.Web.Login.Utilities;
using System.Web;
using System.Web.Hosting;
using System.IO;
using System.Web.Script.Serialization;
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
                JavaScriptSerializer js = new JavaScriptSerializer();
                int type = js.Deserialize<int>(HttpContext.Current.Request["Type"]);

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
                    userJustCreated.Type = type;
                    userJustCreated.NickName = nickName;
                    userJustCreated.Signature = signature;
                    userJustCreated.CreatedBy = jwtResult.JwtUser.User;
                    userJustCreated.Admins = jwtResult.JwtUser.User;

                    db.SaveChanges();

                    Helpers.Email(
                            new MailAddress("donotreply@reddah.com", "Reddah Public Platform Account"),
                            new MailAddress(email, userName),
                            string.Format("Verify your email address‏ for {0}", nickName),
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
                int type = js.Deserialize<int>(HttpContext.Current.Request["type"]);

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
                             where u.Type == type &&
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
                            where u.Type != 0 && (u.CreatedBy == jwtResult.JwtUser.User ||
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

        [Route("getfocus")]
        [HttpPost]
        public IHttpActionResult getFocus()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    //if chat not exist, create one

                    Article existingChat = db.Article.FirstOrDefault(a => (a.Type == 22 ||a.Type==220) &&
                        (a.GroupName.StartsWith(targetUser + ",") ||
                        a.GroupName.EndsWith("," + targetUser))
                        &&
                        (a.GroupName.StartsWith(jwtResult.JwtUser.User + ",") ||
                        a.GroupName.EndsWith("," + jwtResult.JwtUser.User))
                    );
                    //a.GroupName.Split(',').Contains(targetUser) && a.GroupName.Split(',').Contains(jwtResult.JwtUser.User));

                    if (existingChat == null)
                    {
                        existingChat = new Article();
                        existingChat.Type = 22;
                        existingChat.GroupName = targetUser + "," + jwtResult.JwtUser.User;

                        existingChat.CreatedOn = DateTime.UtcNow;
                        existingChat.UserName = jwtResult.JwtUser.User;
                        existingChat.Title = "chat";
                        existingChat.Content = "chat"; 
                        existingChat.Abstract = "chat";
                        db.Article.Add(existingChat);
                        db.SaveChanges();
                    }

                    //has been unfocus before
                    if (existingChat.Type == 220)
                        existingChat.Type = 22;

                    //start loading unread chat messages
                    int pageCount = 10;
                    var comments = (from c in db.Comment
                                    join u in db.UserProfile on c.UserName equals u.UserName
                                    where c.ArticleId == existingChat.Id
                                    orderby c.Id descending
                                    select new AdvancedComment
                                    {
                                        Id = c.Id,
                                        ArticleId = c.ArticleId,
                                        ParentId = c.ParentId,
                                        Content = c.Content,
                                        CreatedOn = c.CreatedOn,
                                        Up = c.Up,
                                        Down = c.Down,
                                        Count = c.Count,
                                        UserName = c.UserName,
                                        Status = c.Status,
                                        UserNickName = u.NickName,
                                        UserPhoto = u.Photo,
                                        UserSex = u.Sex,
                                        Type = c.Type,
                                        Duration = c.Duration
                                    }).Take(pageCount).OrderBy(n => n.Id);

                    return Ok(new ApiResult(0, new SeededComments { Seed = existingChat.Id, Comments = comments.ToList() }));
                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        [Route("setfocus")]
        [HttpPost]
        public IHttpActionResult setFocus()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    //if chat not exist, create one
                    Article existingChat = db.Article.FirstOrDefault(a => (a.Type == 22 || a.Type == 220) &&
                        (a.GroupName.StartsWith(targetUser + ",") ||
                        a.GroupName.EndsWith("," + targetUser))
                        &&
                        (a.GroupName.StartsWith(jwtResult.JwtUser.User + ",") ||
                        a.GroupName.EndsWith("," + jwtResult.JwtUser.User))
                    );
                    //a.GroupName.Split(',').Contains(targetUser) && a.GroupName.Split(',').Contains(jwtResult.JwtUser.User));

                    if (existingChat == null)
                    {
                        existingChat = new Article();
                        existingChat.Type = 22;
                        existingChat.GroupName = targetUser + "," + jwtResult.JwtUser.User;

                        existingChat.CreatedOn = DateTime.UtcNow;
                        existingChat.UserName = jwtResult.JwtUser.User;
                        existingChat.Title = "chat";
                        existingChat.Content = "chat";
                        existingChat.Abstract = "chat";
                        db.Article.Add(existingChat);

                        db.SaveChanges();
                    }
                    else
                    {
                        //has been unfocus before
                        if (existingChat.Type == 220)
                        {
                            existingChat.Type = 22;

                            db.SaveChanges();
                        }
                    }


                    return Ok(new ApiResult(0, "focus"));
                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }


        }
        [Route("unfocus")]
        [HttpPost]
        public IHttpActionResult unFocus()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    //if chat not exist, create one

                    Article existingChat = db.Article.FirstOrDefault(a => a.Type == 22 &&
                        (a.GroupName.StartsWith(targetUser + ",") ||
                        a.GroupName.EndsWith("," + targetUser))
                        &&
                        (a.GroupName.StartsWith(jwtResult.JwtUser.User + ",") ||
                        a.GroupName.EndsWith("," + jwtResult.JwtUser.User))
                    );

                    if (existingChat != null)
                    {
                        existingChat.Type = 220;
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "unfocus"));
                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        [Route("focuspubs")]
        [HttpPost]
        public IHttpActionResult GetFocusPubs()
        {
            IEnumerable<AdvancedPub> query = null;

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
                    query = from a in db.Article
                            join u in db.UserProfile on a.GroupName.Replace(","+ jwtResult.JwtUser.User, "") equals u.UserName
                            where a.UserName == jwtResult.JwtUser.User && a.Type==22
                            select new AdvancedPub
                            {
                                UserName = u.UserName,
                                UserNickName = u.NickName,
                                Signature = u.Signature,
                                UserPhoto = u.Photo,
                                UserCover = u.Cover,
                                Email = u.Email
                            };

                    return Ok(query.ToList());
                }

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }


        [Route("addpubarticle")]
        [HttpPost]
        public IHttpActionResult AddPubArticle()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string title = HttpContext.Current.Request["title"].Trim();
                string content = HttpContext.Current.Request["content"].Trim();
                string groupName = HttpContext.Current.Request["groupName"].Trim();
                string targetUserName = HttpContext.Current.Request["targetUserName"].Trim();
                string locale = HttpContext.Current.Request["locale"].Trim();

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);

                if (String.IsNullOrWhiteSpace(title))
                    return Ok(new ApiResult(1, "title empty"));
                if (String.IsNullOrWhiteSpace(content))
                    return Ok(new ApiResult(1, "content empty"));
                
                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        if (id > 0)
                        {
                            //update pub article
                            var existPubArticle = db.Article.FirstOrDefault(a => a.Id == id && a.Type == 0);
                            if (existPubArticle!=null)
                            {
                                String[] articleGroupNames = groupName.Split(',');
                                foreach (string articleGroupName in articleGroupNames)
                                {
                                    if (db.Group.FirstOrDefault(g => g.Name == articleGroupName.Trim()) == null)
                                    {
                                        db.Group.Add(new Group
                                        {
                                            Name = articleGroupName.Trim(),
                                            CreatedOn = DateTime.Now
                                        });
                                    }
                                }

                                existPubArticle.Title = Helpers.HtmlEncode(title);
                                existPubArticle.Content = Helpers.HtmlEncode(content);
                                
                                existPubArticle.GroupName = Helpers.HtmlEncode(groupName);
                                existPubArticle.LastUpdateOn = DateTime.UtcNow;
                                existPubArticle.LastUpdateBy = jwtResult.JwtUser.User;
                            }
                        }
                        else
                        {
                            //add pub article
                            db.Article.Add(new Article()
                            {
                                Title = Helpers.HtmlEncode(title),
                                Content = Helpers.HtmlEncode(content),
                                
                                CreatedOn = DateTime.UtcNow,
                                Count = 0,
                                GroupName = Helpers.HtmlEncode(groupName),
                                UserName = targetUserName,
                                CreatedBy = jwtResult.JwtUser.User,
                                LastUpdateOn = DateTime.UtcNow,
                                LastUpdateBy = jwtResult.JwtUser.User,
                                Locale = locale,
                                Type = 0,
                                Status = 0, //0 draft, 1 published
                            });
                        }

                        db.SaveChanges();

                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "New pub article added"));

            }
            catch (Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }



        }

        [Route("addpubmini")]
        [HttpPost]
        public IHttpActionResult AddPubMini()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string jsText = HttpContext.Current.Request["title"].Trim();
                string htmlText = HttpContext.Current.Request["content"].Trim();
                string cssText = HttpContext.Current.Request["abstract"].Trim();
                string groupName = HttpContext.Current.Request["groupName"].Trim();
                string targetUserName = HttpContext.Current.Request["targetUserName"].Trim();
                string locale = HttpContext.Current.Request["locale"].Trim();

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);

                if (String.IsNullOrWhiteSpace(jsText))
                    return Ok(new ApiResult(1, "js empty"));
                if (String.IsNullOrWhiteSpace(htmlText))
                    return Ok(new ApiResult(1, "html empty"));
                if (String.IsNullOrWhiteSpace(cssText))
                    return Ok(new ApiResult(1, "css empty"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        if (id > 0)
                        {
                            //update pub article
                            var existPubArticle = db.Article.FirstOrDefault(a => a.Id == id && a.Type == 0);
                            if (existPubArticle != null)
                            {
                                String[] articleGroupNames = groupName.Split(',');
                                foreach (string articleGroupName in articleGroupNames)
                                {
                                    if (db.Group.FirstOrDefault(g => g.Name == articleGroupName.Trim()) == null)
                                    {
                                        db.Group.Add(new Group
                                        {
                                            Name = articleGroupName.Trim(),
                                            CreatedOn = DateTime.Now
                                        });
                                    }
                                }

                                existPubArticle.Title = Helpers.HtmlEncode(jsText);
                                existPubArticle.Content = Helpers.HtmlEncode(htmlText);
                                existPubArticle.Abstract = Helpers.HtmlEncode(cssText);
                                existPubArticle.GroupName = Helpers.HtmlEncode(groupName);
                                existPubArticle.LastUpdateOn = DateTime.UtcNow;
                                existPubArticle.LastUpdateBy = jwtResult.JwtUser.User;
                                existPubArticle.LastUpdateType = 100;

                                this.saveMiniFile(existPubArticle.UserName, "js", jsText, jwtResult.JwtUser.User, db);
                                this.saveMiniFile(existPubArticle.UserName, "html", htmlText, jwtResult.JwtUser.User, db);
                                this.saveMiniFile(existPubArticle.UserName, "css", cssText, jwtResult.JwtUser.User, db);
                            }
                        }
                        else
                        {
                            //add pub article
                            db.Article.Add(new Article()
                            {
                                Title = Helpers.HtmlEncode(jsText),
                                Content = Helpers.HtmlEncode(htmlText),
                                Abstract = Helpers.HtmlEncode(cssText),
                                CreatedOn = DateTime.UtcNow,
                                Count = 0,
                                GroupName = Helpers.HtmlEncode(groupName),
                                UserName = targetUserName,
                                CreatedBy = jwtResult.JwtUser.User,
                                LastUpdateOn = DateTime.UtcNow,
                                LastUpdateBy = jwtResult.JwtUser.User,
                                Locale = locale,
                                Type = 0,
                                Status = 0, //0 draft, 1 published,
                                LastUpdateType = 100
                            });

                            this.saveMiniFile(targetUserName, "js", jsText, jwtResult.JwtUser.User, db);
                            this.saveMiniFile(targetUserName, "html", htmlText, jwtResult.JwtUser.User, db);
                            this.saveMiniFile(targetUserName, "css", cssText, jwtResult.JwtUser.User, db);
                        }

                        db.SaveChanges();

                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "New pub article added"));

            }
            catch (Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }



        }

        private void saveMiniFile(string miniGuid, string fileFormat, string content, string userName, reddahEntities db)
        {
            string uploadedImagePath = "/uploadPhoto/";
            string uploadImageServerPath = "~" + uploadedImagePath;

            var fileName = Path.GetFileName(miniGuid + "." + fileFormat);
            var filePhysicalPath = HostingEnvironment.MapPath(uploadImageServerPath + "/" + fileName);
            
            if (!Directory.Exists(HostingEnvironment.MapPath(uploadImageServerPath)))
            {
                Directory.CreateDirectory(HostingEnvironment.MapPath(uploadImageServerPath));
            }

            using (StreamWriter sw = new StreamWriter(filePhysicalPath, false, System.Text.Encoding.UTF8))
            {
                sw.Write(content);
            }
                
            var url = uploadedImagePath + fileName;

            var exist = db.UploadFile.FirstOrDefault(u => u.Guid == miniGuid && u.Format == fileFormat);
            if (exist == null)
            {
                UploadFile file = new UploadFile();
                file.Guid = miniGuid;
                file.Format = fileFormat;
                file.UserName = userName;
                file.CreatedOn = DateTime.UtcNow;
                file.GroupName = "";
                file.Tag = "";
                db.UploadFile.Add(file);
            }
        }


        [Route("publisharticle")]
        [HttpPost]
        public IHttpActionResult PublishArticle()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                
                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        if (id > 0)
                        {
                            var draftPubArticle = db.Article.FirstOrDefault(a => a.Id == id && a.Type == 0 && a.Status==0);
                            if (draftPubArticle != null)
                            {
                                draftPubArticle.LastUpdateOn = DateTime.UtcNow;
                                draftPubArticle.LastUpdateBy = jwtResult.JwtUser.User;
                                draftPubArticle.Status = 1; //0 draft, 1 published

                                db.SaveChanges();
                            }
                        }
                        else
                        {
                            Ok(new ApiResult(2, "draft article not exist"));
                        }
                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "New pub article added"));

            }
            catch (Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }



        }

        [Route("publishprogram")]
        [HttpPost]
        public IHttpActionResult PublishProgram()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        if (id > 0)
                        {
                            var draftPubArticle = db.Article.FirstOrDefault(a => a.Id == id && a.Type == 0 && a.Status == 0);
                            if (draftPubArticle != null)
                            {
                                draftPubArticle.LastUpdateOn = DateTime.UtcNow;
                                draftPubArticle.LastUpdateBy = jwtResult.JwtUser.User;
                                draftPubArticle.Status = 1; //0 draft, 1 published
                                var user = db.UserProfile.FirstOrDefault(u => u.UserName == draftPubArticle.UserName);
                                if (user != null)
                                {
                                    user.Cover = draftPubArticle.Content;
                                    user.Sex = draftPubArticle.Id;
                                }
                                else
                                {
                                    Ok(new ApiResult(2, "mini program not exist"));
                                }
                                db.SaveChanges();
                            }
                        }
                        else
                        {
                            Ok(new ApiResult(2, "draft article not exist"));
                        }
                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "mini program published"));

            }
            catch (Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }



        }

        [Route("getmaterial")]
        [HttpPost]
        public IHttpActionResult GetMaterial()
        {
            IEnumerable<Article> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

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

                    query = (from b in db.Article
                             join u in db.UserProfile on b.UserName equals u.UserName
                             where b.Type == 5 && b.Status != -1 
                             && !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select new AdvancedTimeline
                             {
                                 Id = b.Id,
                                 Title = b.Title,
                                 Content = b.Content,
                                 Abstract = b.Abstract,
                                 CreatedOn = b.CreatedOn,
                                 Up = b.Up,
                                 Down = b.Down,
                                 Count = b.Count,
                                 UserName = b.UserName,
                                 GroupName = b.GroupName,
                                 Locale = b.Locale,
                                 LastUpdateOn = b.LastUpdateOn,
                                 Type = b.Type,
                                 Ref = b.Ref,
                                 Location = b.Location,
                                 UserNickName = u.NickName,
                                 UserPhoto = u.Photo,
                                 UserSex = u.Sex
                             })
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getsuggestmini")]
        [HttpPost]
        public IHttpActionResult GetSuggestMini()
        {
            IEnumerable<UserInfo> query = null;

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
                    query = (from user in db.UserProfile
                             where user.Type == 3 && user.Point>0
                             orderby user.Point descending
                             select new UserInfo
                             {
                                UserName = user.UserName,
                                NickName = user.NickName ?? user.UserName,
                                Sex = user.Sex ?? 0,
                                Photo = user.Photo,
                                Location = user.Location,
                                Admins = user.Admins,
                                Point = user.Point,
                                Signature = user.Signature,
                                Cover = user.Cover,
                                Type = user.Type,
                                Email = user.Email,
                                HideLocation = (user.PrivacyShowLocation == 1),
                                AllowTenTimeline = (user.PrivacyViewTs == 1)
                    }).Take(50);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("setrecentmini")]
        [HttpPost]
        public IHttpActionResult SetUserRecentMini()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetMiniId = HttpContext.Current.Request["id"];

                if (String.IsNullOrWhiteSpace(targetMiniId))
                    return Ok(new ApiResult(1, "No Mini Id"));

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User && u.Type == 0);

                    if (target != null)
                    {
                        var usedMin = target.UsedMini;
                        if (string.IsNullOrWhiteSpace(usedMin))
                        {
                            target.UsedMini = targetMiniId;
                            db.SaveChanges();
                        }
                        else
                        {
                            if (usedMin != targetMiniId)
                            {
                                usedMin = usedMin.Replace(targetMiniId + ",", "");
                                usedMin = usedMin.Replace("," + targetMiniId + ",", "");
                                usedMin = usedMin.Replace("," + targetMiniId, "");
                                usedMin = targetMiniId + "," + usedMin;
                                target.UsedMini = usedMin;
                                db.SaveChanges();
                            }
                        }
                        return Ok(new ApiResult(0, "success"));
                    }
                    else
                    {
                        return Ok(new ApiResult(2, "user does not exist:" + jwtResult.JwtUser.User));
                    }
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getusedmini")]
        [HttpPost]
        public IHttpActionResult GetUsedMini()
        {
            IEnumerable<UserProfile> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var item = db.UserProfile.FirstOrDefault(u => u.UserName == targetUser);
                    if (item != null)
                    {
                        var usedMinis = item.UsedMini;

                        var pageCount = 10;
                        query = (from u in db.UserProfile
                                 where 
                                 item.UsedMini.StartsWith(u.UserName + ",") ||
                                        item.UsedMini.Contains("," + u.UserName + ",") ||
                                        item.UsedMini.EndsWith("," + u.UserName)
                                 select u)
                                .Take(pageCount);

                    }
                    return Ok(query.ToList());
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        //mini or pub
        [Route("getuserbyid")]
        [HttpPost]
        public IHttpActionResult GetUserById()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                int id = int.Parse(HttpContext.Current.Request["Id"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {

                    var user = db.UserProfile.FirstOrDefault(a => a.UserId == id);
                    if (user != null)
                    {
                        return Ok(new ApiResult(0, user));
                    }
                    else
                    {
                        return Ok(new ApiResult(3, "User not found"));
                    }

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

    }
}
