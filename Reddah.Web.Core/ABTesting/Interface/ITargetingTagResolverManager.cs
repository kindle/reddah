namespace Reddah.Web.Core.ABTesting
{
    using System.Web;
    using System.Collections.Generic;

    public interface ITargetingTagResolverManager
    {
        string GetTargetingTagsForVaryByCustom(HttpContextBase context);
        string[] GetTargetingTags();
        void AddTagsUsedForPath(string path, IEnumerable<string> usedTags);
    }
}
