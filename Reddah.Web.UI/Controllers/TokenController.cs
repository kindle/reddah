using CaptchaMvc.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.Xml;
using log4net;

namespace Reddah.Web.UI.Controllers
{
    public class TokenController : Controller
    {
        private readonly log4net.ILog log = log4net.LogManager.GetLogger("MyLogger");
        private const string Token1 = "test123";

        public ActionResult Index() 
        {
            if (Request.HttpMethod.ToUpper() == "GET")
            {
                Verify();
            }
            else 
            {
                Post();
            }

            return View();
        }

        private void Post()
        {
            string echoStr = Request.QueryString["echoStr"];
            string signature = Request.QueryString["signature"];
            string timestamp = Request.QueryString["timestamp"];
            string nonce = Request.QueryString["nonce"];
            if (CheckSignature(signature, timestamp, nonce, Token1))
            {
                string postString = string.Empty;
                using (var stream = Request.InputStream)
                {
                    Byte[] postBytes = new Byte[stream.Length];
                    stream.Read(postBytes, 0, (Int32)stream.Length);

                    postString = Encoding.GetEncoding("GBK").GetString(postBytes);
                    string responseContent = ReturnMessage(postString);
                    Response.ContentEncoding = Encoding.UTF8;
                    Response.Write(responseContent);
                }
            }
            else 
            {
                Response.Write("Invalid Post");
            }
            Response.End();
        }

        private void Verify()
        {
            string echoStr = Request.QueryString["echoStr"];
            
            if (string.IsNullOrEmpty(echoStr))
            {
                return;
            }
            string signature = Request.QueryString["signature"];
            string timestamp = Request.QueryString["timestamp"];
            string nonce = Request.QueryString["nonce"];
            if (CheckSignature(signature, timestamp, nonce, Token1))
            {
                Response.Write(echoStr);
                Response.End();
            }
        }

        private string ReturnMessage(string postStr)
        {
 　　       string responseContent = "";
 　　       XmlDocument xmldoc = new XmlDocument();
　　        xmldoc.Load(new System.IO.MemoryStream(System.Text.Encoding.GetEncoding("GB2312").GetBytes(postStr)));
　 　       XmlNode MsgType = xmldoc.SelectSingleNode("/xml/MsgType");
　　        if (MsgType != null)
　　        {
　　　 　       switch (MsgType.InnerText)
　　　 　       {
　　　 　　　       case "event":
　　　 　　　　　       responseContent = EventHandle(xmldoc);
　　　 　　　　　       break;
　　　　 　　       case "text":
　　　　 　　　　       responseContent = TextHandle(xmldoc);
　　　　 　　　　       break;
　　　　 　　       default:
　　　　　　 　　       break;
　　　          }
　　        }
　　        return responseContent;
        }

        private const string TextResponseFormat = "<xml><ToUserName><![CDATA[{0}]]></ToUserName>"
                + "<FromUserName><![CDATA[{1}]]></FromUserName>"
                + "<CreateTime>{2}</CreateTime>"
                + "<MsgType><![CDATA[text]]></MsgType>"
                + "<Content><![CDATA[{3}]]></Content>"
                + "<MsgId>1234567890123456</MsgId></xml>";

        private string TextHandle(XmlDocument xmldoc)
        {
            string responseContent = "";
 　　       XmlNode ToUserName = xmldoc.SelectSingleNode("/xml/ToUserName");
　　        XmlNode FromUserName = xmldoc.SelectSingleNode("/xml/FromUserName");
　　        XmlNode Content = xmldoc.SelectSingleNode("/xml/Content");

　　        if (Content != null)
　　        {
              if (Content.InnerText == "你好" ||
                  Content.InnerText.ToLowerInvariant() == "hi" ||
                  Content.InnerText.ToLowerInvariant() == "hello")
              {
                  responseContent = string.Format(TextResponseFormat,
                    FromUserName.InnerText,
                    ToUserName.InnerText,
                    DateTime.Now.Ticks,
                    "恭喜你中大奖啦！");
              }
              else if (Content.InnerText == "牙")
              {
                  responseContent = string.Format(TextResponseFormat,
                    FromUserName.InnerText,
                    ToUserName.InnerText,
                    DateTime.Now.Ticks,
                    "保护好你的牙牙哟~");
              }
              else {
                  responseContent = string.Format(TextResponseFormat,
                    FromUserName.InnerText,
                    ToUserName.InnerText,
                    DateTime.Now.Ticks,
                    Content.InnerText);
              }
　　        }
　　        return responseContent;
        }



        public string EventHandle(XmlDocument xmldoc)
        {
            string responseContent = "";
            XmlNode Event = xmldoc.SelectSingleNode("/xml/Event");
            XmlNode EventKey = xmldoc.SelectSingleNode("/xml/EventKey");
            XmlNode ToUserName = xmldoc.SelectSingleNode("/xml/ToUserName");
            XmlNode FromUserName = xmldoc.SelectSingleNode("/xml/FromUserName");
            if (Event != null)
            {
                //菜单单击事件
                if (Event.InnerText.Equals("CLICK"))
                {
                    if (EventKey.InnerText.Equals("11"))//click_one
                    {
                        string typeid = "d19cace294e745fa8e38a8a1593703"; //类型ID：通知公告
                        responseContent = "";// GetStrJsonDynamiclly(xmldoc, typeid);
                    }
                }
                else if (Event.InnerText.ToLowerInvariant().Equals("subscribe"))
                {
                    responseContent = string.Format(TextResponseFormat,
                    FromUserName.InnerText,
                    ToUserName.InnerText,
                    DateTime.Now.Ticks,
                    FromUserName.InnerText+", 欢迎订阅");
                }
            }

            return responseContent;

        }

        private bool CheckSignature(string signature, string timestamp, string nonce, string token)
        {
            if (string.IsNullOrEmpty(signature) || string.IsNullOrEmpty(timestamp) || string.IsNullOrEmpty(nonce))
            {
                return false;
            }

            string[] ArrTmp = { token, timestamp, nonce };
            Array.Sort(ArrTmp);
            string tmpStr = string.Join("", ArrTmp);
            tmpStr = SHA1_Hash(tmpStr);
            tmpStr = tmpStr.ToLower();

            return tmpStr == signature;
        }

        private string SHA1_Hash(string str_sha1_in)
        {
            SHA1 sha1 = new SHA1CryptoServiceProvider();
            byte[] bytes_sha1_in = UTF8Encoding.Default.GetBytes(str_sha1_in);
            byte[] bytes_sha1_out = sha1.ComputeHash(bytes_sha1_in);
            string str_sha1_out = BitConverter.ToString(bytes_sha1_out);
            str_sha1_out = str_sha1_out.Replace("-", "");
            return str_sha1_out;
        }
    }
}
