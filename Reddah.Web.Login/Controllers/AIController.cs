using System;

using System.Linq;
using System.Web.Http;
using System.Web;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using Reddah.Web.Login.Utilities;
using System.Text;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/ai")]
    public class AIController : ApiBaseController
    {
        [Route("nlp")]
        [HttpPost]
        public async Task<IHttpActionResult> GetNlpChat()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string text = HttpContext.Current.Request["content"];
                string locale = HttpContext.Current.Request["locale"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                if(locale == "zh-CN"|| locale == "zh-TW")
                {
                    return Ok(new ApiResult(0, await this.QqNlp(
                        locale,
                        jwtResult.JwtUser.User,
                        text)));
                }
                else
                {
                    return Ok(new ApiResult(0, await this.GoogleNlp(
                        locale, 
                        jwtResult.JwtUser.User, 
                        text)));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        private async Task<string> GoogleNlp(string locale, string user, string text)
        {
            string serviceUrl = "https://console.dialogflow.com/api-client/demo/embedded";
            string projectId = "ee71c857-1854-433c-84e8-78b53b87fd99";
            
            string sessionId = user + "_" + locale;

            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);

            var endpointUri = String.Format("{0}/{1}/demoQuery?q={2}&sessionId={3}",
                    serviceUrl, projectId, text, sessionId);

            var response = await client.GetAsync(endpointUri);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();

            return responseText;

            /*
            string serviceUrl = "https://console.dialogflow.com/api-client/demo/embedded";
            string projectId_en_US = "ee71c857-1854-433c-84e8-78b53b87fd99";
            string projectId_zh_CN = "4d498fad-2a1f-4240-9b67-497b0cdac651";

            string projectId = projectId_en_US;
            if (locale == "zh-CN")
                projectId = projectId_zh_CN;

            string sessionId = jwtResult.JwtUser.User + "_" + locale;

            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);

            var endpointUri = String.Format("{0}/{1}/demoQuery?q={2}&sessionId={3}",
                    serviceUrl, projectId, text, sessionId);

            var response = await client.GetAsync(endpointUri);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();*/
        }

        private async Task<string> QqNlp(string locale, string user, string uri)
        {
            
            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            
            using (var db = new reddahEntities())
            {
                var log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = "chat";
                log.Level = locale;
                log.Logger = user;
                log.Message = uri;
                db.Log.Add(log);
                db.SaveChanges();
            }

            var response = await client.GetAsync(uri);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();

            return responseText;
        }





        private async Task<string> QqNlp_obelete(string locale, string user, string text, string timestamp)
        {
            string serviceUrl = "https://api.ai.qq.com/fcgi-bin/nlp/nlp_textchat";
            int appId = 2127183732;
            string appKey = "493J0jD8PPeNUHNz";

            string sessionId = user + "_" + locale;

            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            Dictionary<string, string> param = new Dictionary<string, string>();
            param.Add("app_id", appId.ToString());
            param.Add("time_stamp", timestamp);
            param.Add("nonce_str", "20e3408a79");
            param.Add("session", "10001");
            param.Add("question", text);
            param.Add("sign", "");

            //var encoding = System.Text.Encoding.GetEncoding("utf-8");

            var endpointUri = String.Format("{0}?app_id={1}&time_stamp={2}&nonce_str={3}&session={4}&question={5}&sign={6}",
                    serviceUrl,
                    param["app_id"],
                    param["time_stamp"],
                    param["nonce_str"],
                    param["session"],
                    param["question"],
                    this.getReqSign(param, appKey));

            using (var db = new reddahEntities())
            {
                var log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = "";
                log.Level = "";
                log.Logger = "";
                log.Message = endpointUri;
                db.Log.Add(log);
                db.SaveChanges();
            }

            var response = await client.GetAsync(endpointUri);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();

            return responseText;
        }

        private string getReqSign(Dictionary<string, string> org, string appKey)
        {
            //ksort
            var param = org.OrderBy(a => a.Key).ToDictionary(o=>o.Key, p=>p.Value);

            string str = "";
            foreach(var key in param.Keys){
                string val = param[key];
                if (!string.IsNullOrWhiteSpace(val))
                {
                    str += key + "=" + HttpUtility.UrlEncode(val) + "&";
                }
            }

            str += "app_key=" + appKey;
            using (var db = new reddahEntities())
            {
                var log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = "";
                log.Level = "";
                log.Logger = "str";
                log.Message = str;
                db.Log.Add(log);

                log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = "";
                log.Level = "";
                log.Logger = "md5";
                log.Message = Helpers.Md5(str).ToUpper();
                db.Log.Add(log);

                db.SaveChanges();


            }

            return Helpers.Md5(str).ToUpper();
        }


        [Route("qqmusk")]
        [HttpPost]
        public async Task<IHttpActionResult> GetQqMusk()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string locale = HttpContext.Current.Request["locale"];
                string url = HttpContext.Current.Request["url"];
                string image = HttpContext.Current.Request["image"];

                /*
                var musk = new FaceMusk();
                musk.app_id = app_id;
                musk.decoration = decoration;
                musk.time_stamp = time_stamp;
                musk.app_key = app_key;
                musk.nonce_str = nonce_str;
                musk.sign = sign;
                musk.image = image;

                var myContent = JsonConvert.SerializeObject(musk);
                var buffer = Encoding.UTF8.GetBytes(myContent);
                var byteContent = new ByteArrayContent(buffer);
                byteContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                */

                /*
                var content = new List<KeyValuePair<string, object>>
                {
                    new KeyValuePair<string, object>("app_id", app_id),
                    new KeyValuePair<string, object>("decoration", decoration),
                    new KeyValuePair<string, object>("time_stamp", time_stamp),
                    new KeyValuePair<string, object>("app_key", app_key),
                    new KeyValuePair<string, object>("nonce_str", nonce_str),
                    new KeyValuePair<string, object>("sign", sign),
                    new KeyValuePair<string, object>("image", image),

                };

                var mycontent = new StringContent(content.ToString());
                */

                /*
                var content = new StringContent(jsonObject.ToString(), Encoding.UTF8, "application/json");
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                */

                /*
                var content = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("app_id", app_id.ToString()),
                    new KeyValuePair<string, string>("decoration", decoration.ToString()),
                    new KeyValuePair<string, string>("time_stamp", time_stamp.ToString()),
                    new KeyValuePair<string, string>("app_key", app_key),
                    new KeyValuePair<string, string>("nonce_str", nonce_str),
                    new KeyValuePair<string, string>("sign", sign),
                    new KeyValuePair<string, string>("image", image),

                };

                var mycontent = new StringContent(content.ToString());
                */

                /*
                var data = new
                {
                    app_id = app_id,
                    decoration = decoration,
                    time_stamp = time_stamp,
                    app_key = app_key,
                    nonce_str = nonce_str,
                    sign = sign,
                    image = image
                };
                var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                */

                /*
                var content = new StringContent(JsonConvert.SerializeObject(jsonObject), Encoding.UTF8, "application/json");
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                */

                /*
                var multiContent = new MultipartFormDataContent();
                var content1 = new List<KeyValuePair<string, int>>
                {
                    new KeyValuePair<string, int>("app_id", app_id),
                    new KeyValuePair<string, int>("decoration", decoration),
                    new KeyValuePair<string, int>("time_stamp", time_stamp),
                };
                var content2 = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("app_key", app_key),
                    new KeyValuePair<string, string>("nonce_str", nonce_str),
                    new KeyValuePair<string, string>("sign", sign),
                    new KeyValuePair<string, string>("image", image)
                });

                multiContent.Add(new StringContent(content1.ToString()));
                multiContent.Add(content2);
                */


                var fcontent = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("image", image)
                });


                //var content = new StringContent(str, Encoding.UTF8, "application/json");

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                return Ok(new ApiResult(0, await this.QqAiTask(
                    locale,
                    jwtResult.JwtUser.User,
                    url,
                    fcontent, 
                    "qqmusk")));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        private async Task<string> QqAiTask(string locale, string user, string uri, FormUrlEncodedContent content, string thread)
        {
            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);

            using (var db = new reddahEntities())
            {
                var log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = thread;
                log.Level = locale;
                log.Logger = user;
                log.Message = uri;
                db.Log.Add(log);
                db.SaveChanges();
            }

            var response = await client.PostAsync(uri, content);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();

            return responseText;
        }
    }

    
}
