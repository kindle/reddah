namespace Reddah.Web.Live.ABTesting
{
    using System.Web;
    using Reddah.Web.Core.ABTesting;

    public class HttpContextRequestPathProvider : IRequestPathProvider
    {
        public string GetRequestPath()
        {
            return HttpContext.Current.Request.Url.AbsolutePath;
        }
    }
}
