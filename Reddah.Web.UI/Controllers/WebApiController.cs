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

    /// <summary>
    /// Web Api controller
    /// </summary>
    public class WebApiController : ApiController
    {
        
        /// <summary>
        /// Get Articles
        /// </summary>
        /// <returns>list of posts</returns>
        [HttpPost]
        public IEnumerable<ArticlePreview> GetArticles([FromBody] int[] loadedIds)
        {
            IEnumerable<ArticlePreview> result = null;

            UserProfileModel userProfileModel = new UserProfileModel();
            userProfileModel.LoadedIds = loadedIds;
            userProfileModel.Locale = "en-us";
            userProfileModel.Menu = "new";

            result = new UserProfileArticleViewModel(userProfileModel).Articles;
            
            return result;
            
        }
    }
}
