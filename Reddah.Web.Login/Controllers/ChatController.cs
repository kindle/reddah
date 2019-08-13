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

namespace Reddah.Web.Login.Controllers
{
    /// <summary>
    /// 0 normal
    /// 1 timeline
    /// 2 two chat
    /// 3 group chat 
    /// 4 feedback
    /// 22 two chat pub
    /// </summary>
    [RoutePrefix("api/chat")]
    public class ChatController : ApiBaseController
    {

        [Route("getmessages")]
        [HttpPost]
        public IHttpActionResult GetMessages()
        {
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
                    int pageCount = 100;
                    var messages = (from a in db.Article
                                    //join u in db.UserProfile on c.UserName equals u.UserName
                                    where (a.Type==2 || a.Type==3) && (a.GroupName.StartsWith(jwtResult.JwtUser.User + ",") ||
                                        a.GroupName.Contains("," + jwtResult.JwtUser.User + ",") ||
                                        a.GroupName.EndsWith("," + jwtResult.JwtUser.User))
                                    orderby a.LastUpdateOn descending
                                    select a).Take(pageCount);

                    return Ok(new ApiResult(0, messages.ToList()));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        [Route("getchat")]
        [HttpPost]
        public IHttpActionResult GetChat()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);
                int limit = js.Deserialize<int>(HttpContext.Current.Request["limit"]);

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

                        existingChat.CreatedOn = DateTime.UtcNow;
                        existingChat.UserName = jwtResult.JwtUser.User;
                        existingChat.Title = "chat";
                        existingChat.Content = "chat";
                        existingChat.Abstract = "chat";
                        db.Article.Add(existingChat);
                        db.SaveChanges();
                    }

                    //start loading unread chat messages
                    if (id == 0)
                    {
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
                                            Duration = c.Duration,
                                            Abstract = c.Abstract
                                        }).Take(limit).OrderBy(n => n.Id);

                        return Ok(new ApiResult(0, new SeededComments { Seed = existingChat.Id, Comments = comments.ToList() }));
                    }
                    else if (id < 0)
                    {
                        var comments = (from c in db.Comment
                                        join u in db.UserProfile on c.UserName equals u.UserName
                                        where c.ArticleId == existingChat.Id && c.Id < id * -1
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
                                            Duration = c.Duration,
                                            Abstract = c.Abstract
                                        }).Take(limit).OrderBy(n => n.Id);

                        return Ok(new ApiResult(0, new SeededComments { Seed = existingChat.Id, Comments = comments.ToList() }));
                    }
                    else
                    {
                        var comments = (from c in db.Comment
                                        join u in db.UserProfile on c.UserName equals u.UserName
                                        where c.ArticleId == existingChat.Id && c.Id > id
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
                                            Duration = c.Duration,
                                            Abstract = c.Abstract
                                        }).OrderBy(n => n.Id);

                        return Ok(new ApiResult(0, new SeededComments { Seed = existingChat.Id, Comments = comments.ToList() }));
                    }

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
                    
                    newGroupChat.CreatedOn = DateTime.UtcNow;
                    newGroupChat.CreatedBy = jwtResult.JwtUser.User; //group creator
                    newGroupChat.Title = "群聊"; //group title
                    newGroupChat.Content = "群公告"; //group anouncement
                    newGroupChat.UserName = jwtResult.JwtUser.User; //group owners, default only 1 - the creator
                    newGroupChat.LastUpdateBy = jwtResult.JwtUser.User;
                    newGroupChat.LastUpdateContent = "我建了一个群，开始聊天吧！";
                    newGroupChat.LastUpdateOn = DateTime.UtcNow;
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
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);
                int limit = js.Deserialize<int>(HttpContext.Current.Request["limit"]);

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
                    if (id == 0)
                    {
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
                                            UserSex = u.Sex,
                                            Type = c.Type,
                                            Duration = c.Duration,
                                            Abstract = c.Abstract
                                        }).Take(limit).OrderBy(n => n.Id);

                        return Ok(new ApiResult(0, new SeededComments { Seed = groupChatId, Comments = comments.ToList() }));
                    }
                    else if (id < 0)
                    {
                        var comments = (from c in db.Comment
                                        join u in db.UserProfile on c.UserName equals u.UserName
                                        where c.ArticleId == groupChatId && c.Id < id*-1
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
                                            Duration = c.Duration,
                                            Abstract = c.Abstract
                                        }).Take(limit).OrderBy(n => n.Id);

                        return Ok(new ApiResult(0, new SeededComments { Seed = groupChatId, Comments = comments.ToList() }));
                    }
                    else
                    {
                        var comments = (from c in db.Comment
                                        join u in db.UserProfile on c.UserName equals u.UserName
                                        where c.ArticleId == groupChatId && c.Id>id
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
                                            Duration = c.Duration,
                                            Abstract = c.Abstract
                                        }).OrderBy(n => n.Id);

                        return Ok(new ApiResult(0, new SeededComments { Seed = groupChatId, Comments = comments.ToList() }));
                    }
                    

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        [Route("getgrouplist")]
        [HttpPost]
        public IHttpActionResult GetGroupList()
        {
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

                    var groupChats = (from a in db.Article
                                      where a.Type == 3 && (a.GroupName.StartsWith(jwtResult.JwtUser.User + ",") ||
                                        a.GroupName.Contains("," + jwtResult.JwtUser.User + ",") ||
                                        a.GroupName.EndsWith("," + jwtResult.JwtUser.User))
                                    orderby a.Id descending
                                    select a);

                    return Ok(new ApiResult(0, groupChats.ToList()));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        [Route("deletegroupchat")]
        [HttpPost]
        public IHttpActionResult DeleteGroupChat()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["Id"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.Article.FirstOrDefault(a=>a.Id==id && a.Type==3);
                    if (target != null)
                    {
                        var me = jwtResult.JwtUser.User;
                        var userList = target.GroupName.Split(',').ToList();
                        if (userList.Contains(me))
                            userList.Remove(me);
                        target.GroupName = string.Join(",", userList);

                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("addtogroupchat")]
        [HttpPost]
        public IHttpActionResult AddToGroupChat()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["Id"]);
                string[] userNames = js.Deserialize<string[]>(HttpContext.Current.Request["UserNames"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.Article.FirstOrDefault(a => a.Type == 3 && a.Id == id);
                    if (target != null)
                    {
                        target.GroupName += "," + string.Join(",", userNames);
                        db.SaveChanges();
                    }
                    
                    return Ok(new ApiResult(0, "Success"));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        [Route("changegroupchattitle")]
        [HttpPost]
        public IHttpActionResult ChangeGroupChatTitle()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetTitle = HttpContext.Current.Request["targetTitle"];
                JavaScriptSerializer js = new JavaScriptSerializer();
                int targetGroupChatId = js.Deserialize<int>(HttpContext.Current.Request["targetGroupChatId"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.Article.FirstOrDefault(a => a.Id==targetGroupChatId && a.Type==3);
                    target.Title = targetTitle;
                    db.SaveChanges();

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }


        [Route("addaudiochat")]
        [HttpPost]
        public IHttpActionResult AddAudioChat()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int articleId = js.Deserialize<int>(HttpContext.Current.Request["ArticleId"]);
                int parentCommentId = js.Deserialize<int>(HttpContext.Current.Request["ParentCommentId"]);
                int duration = js.Deserialize<int>(HttpContext.Current.Request["Duration"]);

                HttpFileCollection hfc = HttpContext.Current.Request.Files;

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        string fileName = string.Empty;
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
                                //var fileName = Path.GetFileName(guid + "." + fileFormat);
                                fileName = Path.GetFileName(guid + "." + fileFormat);
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
                            }
                            catch (Exception ex)
                            {
                                return Ok(new ApiResult(1, ex.Message));
                            }
                        }


                        db.Comment.Add(new Comment()
                        {
                            ArticleId = articleId,
                            ParentId = parentCommentId,
                            Content = fileName,
                            CreatedOn = DateTime.Now,
                            UserName = jwtResult.JwtUser.User,
                            Type=1,
                            Duration=duration
                        });


                        var article = db.Article.FirstOrDefault(a => a.Id == articleId);
                        if (article != null)
                        {
                            article.Count++;
                            article.LastUpdateBy = jwtResult.JwtUser.User;
                            article.LastUpdateOn = DateTime.UtcNow;
                            article.LastUpdateContent = "";
                            article.LastUpdateType = 1;
                        }

                        if (parentCommentId != -1)
                        {
                            var parentComment = db.Comment.FirstOrDefault(c => c.Id == parentCommentId);
                            if (parentComment != null)
                            {
                                parentComment.Count++;
                            }
                        }

                        db.SaveChanges();

                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "New audio chat Added"));

            }
            catch (Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }



        }

        //support only 1 image currently
        [Route("addphotocomments")]
        [HttpPost]
        public IHttpActionResult AddPhotoComments()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int articleId = js.Deserialize<int>(HttpContext.Current.Request["ArticleId"]);
                int parentCommentId = js.Deserialize<int>(HttpContext.Current.Request["CommentId"]);
                int fileType = js.Deserialize<int>(HttpContext.Current.Request["FileType"]);//2:image,3videos

                Dictionary<string, string> imageUrls = new Dictionary<string, string>();
                HttpFileCollection hfc = HttpContext.Current.Request.Files;

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        string previewFileName = string.Empty;
                        Dictionary<string, string> dict = new Dictionary<string, string>();
                        foreach (string rfilename in HttpContext.Current.Request.Files)
                        {
                            //upload image first
                            string guid = Guid.NewGuid().ToString().Replace("-", "");
                            string uploadedImagePath = "/uploadPhoto/";
                            string uploadImageServerPath = "~" + uploadedImagePath;

                            HttpPostedFile upload = HttpContext.Current.Request.Files[rfilename];
                            var fileNameKey = rfilename.Replace("_reddah_preview", "");
                            if (fileType == 3)
                                fileNameKey = "videokey";
                            if (!dict.Keys.Contains(fileNameKey))
                            {
                                dict.Add(fileNameKey, guid);
                            }
                            else
                            {
                                guid = dict[fileNameKey];
                            }
                            if (upload.FileName.Contains("_reddah_preview"))
                            {
                                guid += "_reddah_preview";
                            }

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
                                if (upload.FileName.Contains("_reddah_preview."))
                                {
                                    previewFileName = "///login.reddah.com" + url;
                                    if (!imageUrls.Values.Contains("///login.reddah.com" + url))
                                    {
                                        imageUrls.Add(guid.Replace("_reddah_preview", ""), "///login.reddah.com" + url);
                                    }
                                }
                                if (fileType == 3)
                                    previewFileName = "https://login.reddah.com" + url.ToLower().Replace(".jpg",".mp4") ;
                            }
                            catch (Exception ex)
                            {
                                return Ok(new ApiResult(1, ex.Message));
                            }
                        }

                        db.Comment.Add(new Comment()
                        {
                            ArticleId = articleId,
                            ParentId = parentCommentId,
                            Content = previewFileName,
                            CreatedOn = DateTime.Now,
                            UserName = jwtResult.JwtUser.User,
                            Type = fileType,
                        });


                        var article = db.Article.FirstOrDefault(a => a.Id == articleId);
                        if (article != null)
                        {
                            article.Count++;

                            article.LastUpdateBy = jwtResult.JwtUser.User;
                            article.LastUpdateOn = DateTime.UtcNow;
                            article.LastUpdateContent = "";
                            article.LastUpdateType = fileType;
                        }

                        if (parentCommentId != -1)
                        {
                            var parentComment = db.Comment.FirstOrDefault(c => c.Id == parentCommentId);
                            if (parentComment != null)
                            {
                                parentComment.Count++;
                            }
                        }

                        db.SaveChanges();

                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "New audio chat Added"));

            }
            catch (Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }
        }

        //--default 0:text, 1:audio 2:image 3:video 4:link
        [Route("sharetofriend")]
        [HttpPost]
        public IHttpActionResult ShareToFriend()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string shareTitle = HttpContext.Current.Request["abstract"];
                string shareImageUrl = HttpContext.Current.Request["content"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int refArticleId = js.Deserialize<int>(HttpContext.Current.Request["ref"]);
                int chatId = js.Deserialize<int>(HttpContext.Current.Request["chatid"]);

                if (shareTitle == null)
                    return Ok(new ApiResult(1, "No title"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        db.Comment.Add(new Comment()
                        {
                            ArticleId = chatId,
                            ParentId = -1,
                            Content = shareImageUrl,
                            Abstract = shareTitle,
                            Duration = refArticleId,
                            CreatedOn = DateTime.UtcNow,
                            UserName = jwtResult.JwtUser.User,
                            Type = 4
                        });


                        var article = db.Article.FirstOrDefault(a => a.Id == chatId);
                        if (article != null)
                        {
                            article.Count++;
                        }

                        var chatItem = db.Article.FirstOrDefault(a => a.Id == chatId);
                        if (chatItem != null)
                        {
                            chatItem.LastUpdateBy = jwtResult.JwtUser.User;
                            chatItem.LastUpdateOn = DateTime.UtcNow;
                            article.LastUpdateContent = shareTitle;
                            article.LastUpdateType = 4;
                        }

                        db.SaveChanges();

                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "share to friend"));

            }
            catch (Exception e)
            {
                return Ok(new ApiResult(4, e.Message));
            }



        }

    }

    
}
