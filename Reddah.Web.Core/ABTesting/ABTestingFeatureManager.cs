namespace Reddah.Web.Core.ABTesting
{
    using System.Collections.Generic;
    using System.Linq;

    public class ABTestingFeatureManager
    {
        public IFeatureAudienceMapper FeatureAudienceMapper { get; private set; }
        public IAudienceManager AudienceManager { get; private set; }
        public ITargetingTagResolverManager TagManager { get; private set; }
        public IRequestPathProvider PathProvider { get; private set; }

        public ABTestingFeatureManager(IFeatureAudienceMapper featureAudienceMapper, IAudienceManager audienceManager, ITargetingTagResolverManager tagManager, IRequestPathProvider pathProvider)
        {
            FeatureAudienceMapper = featureAudienceMapper;
            AudienceManager = audienceManager;
            TagManager = tagManager;
            PathProvider = pathProvider;
        }

        public bool IsEnabled(Feature feature)
        {
            //TagManager.AddTagsUsedForPath(PathProvider.GetRequestPath(), new[] { GetTagForFeature(feature) });
            var audiences = AudienceManager.GetCurrentAudiences() ?? new string[] { };
            var featureAudienceMap = FeatureAudienceMapper.GetFeatureAudienceMap();
            if (featureAudienceMap == null)
            {
                return false;
            }
            if (!featureAudienceMap.ContainsKey(feature))
            {
                return false;
            }
            return featureAudienceMap[feature](audiences);
        }

        public static string GetTagForFeature(Feature feature)
        {
            return "feature." + feature;
        }

        public List<string> GetTargetingTags()
        {
            var audiences = AudienceManager.GetCurrentAudiences() ?? new string[] { };
            var featureAudienceMap = FeatureAudienceMapper.GetFeatureAudienceMap();
            if (featureAudienceMap == null)
            {
                return new List<string>();
            }
            return featureAudienceMap
                .Where(kv => kv.Value(audiences))
                .Select(kv => GetTagForFeature(kv.Key))
                .ToList();
        }
    }
}
