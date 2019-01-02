namespace Reddah.Web.UI.Controllers
{
    using Reddah.Web.UI.Filters;
    using Reddah.Web.UI.Models;
    using Reddah.Web.UI.ViewModels;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Web.Http;
    using System.Web.Script.Serialization;
    using System.Web.Security;
    using System.Web.UI;

    public class WebApiController : ApiController
    {
        
        [HttpGet]
        public IEnumerable<ArticlePreview> GetArticles()
        {
            IEnumerable<ArticlePreview> result = null;

            UserProfileModel userProfileModel = new UserProfileModel();
            userProfileModel.LoadedIds = new int[] { };
            userProfileModel.Locale = "zh-cn";
            userProfileModel.Menu = "new";

            result = new UserProfileArticleViewModel(userProfileModel).Articles;
            
            return result;
            
        }
    }
}
