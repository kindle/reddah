namespace Reddah.Web.Core.ABTesting
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using Reddah.Core;
    using Reddah.Core.IoC;

    [PerWebRequestInstance]
    public class TargetingTagResolverManager : ITargetingTagResolverManager
    {
        private static readonly List<ITargetingTagResolver> TargetingTagResolvers = new List<ITargetingTagResolver>();
        private static readonly List<ITargetingTagResolver> OverrideTargetingTagResolvers = new List<ITargetingTagResolver>();

        private readonly ITagUsageCache tagUsageCache;
        private string[] CachedTags { get; set; }

        public TargetingTagResolverManager(ITagUsageCache tagUsageCache)
        {
            this.tagUsageCache = tagUsageCache;
        }

        public static void AddTargetingTagResolver(ITargetingTagResolver targetingTagResolver)
        {
            TargetingTagResolvers.Add(targetingTagResolver);
        }

        public static void AddOverrideTargetingTagResolver(ITargetingTagResolver targetingTagResolver)
        {
            OverrideTargetingTagResolvers.Add(targetingTagResolver);
        }

        public static void ClearTargetingTagResolvers()
        {
            TargetingTagResolvers.Clear();
            OverrideTargetingTagResolvers.Clear();
        }

        public string GetTargetingTagsForVaryByCustom(HttpContextBase context)
        {
            var targetingTags = GetTargetingTags();
            var tagsUsedIntersection = tagUsageCache.GetIntersectOfTagsUsedForPath(context.Request.Url.AbsolutePath, targetingTags);

            return tagsUsedIntersection.JoinStrings(";");
        }

        public string[] GetTargetingTags()
        {
            if (CachedTags == null)
            {
                CachedTags = new string[0]; // This will be used in case of a recursive call to this method
                var overrideTags = OverrideTargetingTagResolvers.Select(r => r.GetTargetingTags()).FirstOrDefault(tags => tags != null);
                if (overrideTags != null)
                {
                    CachedTags = overrideTags.ToArray();
                    return CachedTags;
                }
                CachedTags = TargetingTagResolvers.SelectMany(r => r.GetTargetingTags()).ToArray();
            }
            return CachedTags;
        }

        public void AddTagsUsedForPath(string path, IEnumerable<string> usedTags)
        {
            tagUsageCache.AddTagsUsedForPath(path, usedTags);
        }

    }
}
