namespace Reddah.Web.Core.ABTesting
{
    using System.Collections.Generic;

    public interface ITagUsageCache
    {
        void AddTagsUsedForPath(string siteRelativeContentItemPath, IEnumerable<string> tagsToAdd);
        IEnumerable<string> GetTagsUsedForPath(string siteRelativeContentItemPath);
        IEnumerable<string> GetIntersectOfTagsUsedForPath(string siteRelativeContentItemPath, IEnumerable<string> tags);
    }
}
