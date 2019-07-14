﻿using Microsoft.IdentityModel.Tokens;
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

    }
}
