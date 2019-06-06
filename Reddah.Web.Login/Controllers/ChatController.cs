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

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/chat")]
    public class ChatController : ApiBaseController
    {
        [Route("getchat")]
        [HttpPost]
        public IHttpActionResult GetChat()
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

                    Article existingChat = db.Article.FirstOrDefault(a => a.Type == 2 &&
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
                        existingChat.Type = 2;
                        existingChat.GroupName = targetUser + "," + jwtResult.JwtUser.User;

                        existingChat.CreatedOn = DateTime.Now;
                        existingChat.UserName = jwtResult.JwtUser.User;
                        existingChat.Title = "chat";
                        existingChat.Content = "chat";
                        existingChat.Abstract = "chat";
                        db.Article.Add(existingChat);
                        db.SaveChanges();
                    }

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
                                        UserSex = u.Sex
                                    }).Take(pageCount).OrderBy(n=>n.Id);

                    return Ok(new ApiResult(0, new SeededComments { Seed = existingChat.Id, Comments = comments.ToList() }));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        [Route("creategroupchat")]
        [HttpPost]
        public IHttpActionResult CreateGroupChat()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                JavaScriptSerializer js = new JavaScriptSerializer();
                string[] targetUsers = js.Deserialize<string[]>(HttpContext.Current.Request["targetUsers"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var newGroupChat = new Article();
                    newGroupChat.Type = 3;  //2 two persons' chat, 3 group chat >2 persons

                    //group members
                    newGroupChat.GroupName = jwtResult.JwtUser.User + "," + string.Join(",", targetUsers);
                    
                    newGroupChat.CreatedOn = DateTime.Now;
                    newGroupChat.UserName = jwtResult.JwtUser.User; //group creator
                    newGroupChat.Title = "群聊"; //group title
                    newGroupChat.Content = "群公告"; //group anouncement
                    newGroupChat.Abstract = jwtResult.JwtUser.User; //group owners, default only 1 - the creator
                    db.Article.Add(newGroupChat);
                    db.SaveChanges();

                    return Ok(new ApiResult(0, newGroupChat));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        [Route("getgroupchat")]
        [HttpPost]
        public IHttpActionResult GetGroupChat()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                
                JavaScriptSerializer js = new JavaScriptSerializer();
                int groupChatId = js.Deserialize<int>(HttpContext.Current.Request["groupChatId"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    //if chat not exist, create one
                    var existingGroupChat = db.Article.FirstOrDefault(a=>a.Id==groupChatId);

                    if(existingGroupChat==null)
                        return Ok(new ApiResult(3, "group chat not exist"));

                    //start loading unread chat messages
                    int pageCount = 20;
                    var comments = (from c in db.Comment
                                    join u in db.UserProfile on c.UserName equals u.UserName
                                    where c.ArticleId == groupChatId
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
                                        UserSex = u.Sex
                                    }).Take(pageCount).OrderBy(n => n.Id);

                    return Ok(new ApiResult(0, new SeededComments { Seed = groupChatId, Comments = comments.ToList() }));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }
    }
}
