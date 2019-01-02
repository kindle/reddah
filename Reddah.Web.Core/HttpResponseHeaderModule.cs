using System;
using System.Collections.Generic;
using System.Web;

namespace Reddah.Web.Core
{
    public class HttpResponseHeaderModule : IHttpModule
    {
        private readonly List<string> headers;

        public HttpResponseHeaderModule()
        {
            headers = new List<string>
                      {
                          "Server",
                          "X-AspNet-Version",
                          "X-AspNetMvc-Version"
                      };
        }

        public void Init(HttpApplication context)
        {
            //context.PreSendRequestContent += ModifyHeaders;
        }

        private void ModifyHeaders(object sender, EventArgs e)
        {
            var response = HttpContext.Current.Response;

            // Remove unnecessary HTTP headers from the response.
            headers.ForEach(c => response.Headers.Remove(c));

            // Add X-UA-Compatible header to response if the content is HTML.
            var contentType = response.Headers["Content-Type"];
            if(contentType != null && contentType.StartsWith("text/html") &&
               !response.IsRequestBeingRedirected)
            {
                var compatValue = response.Headers["X-UA-Compatible"] ?? "";
                var compatList =
                    new List<string>(compatValue.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries));
                for (var x = 0; x < compatList.Count; x++)
                {
                    if(compatList[x].Trim().StartsWith("IE=", StringComparison.InvariantCultureIgnoreCase))
                    {
                        compatList.RemoveAt(x);
                    }
                }
                compatList.Insert(0, "IE=edge");
                response.Headers.Remove("X-UA-Compatible");
                response.Headers.Add("X-UA-Compatible", String.Join(",", compatList));
            }
        }

        public void Dispose() { }
    }
}
