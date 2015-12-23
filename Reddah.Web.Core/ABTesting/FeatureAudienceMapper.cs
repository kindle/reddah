namespace Reddah.Web.Core.ABTesting
{
    using System;
    using System.Collections.Generic;
    using System.Linq;

    public class FeatureAudienceMapper : IFeatureAudienceMapper
    {
        public IFeatureAudienceMapProvider FeatureAudienceMapProvider { get; private set; }

        public FeatureAudienceMapper(IFeatureAudienceMapProvider featureAudienceMapProvider)
        {
            FeatureAudienceMapProvider = featureAudienceMapProvider;
        }

        public static bool IsInAudience(string audienceNeeded, IEnumerable<string> audiencesGiven)
        {
            return audienceNeeded.Equals("all", StringComparison.OrdinalIgnoreCase) ||
                   audiencesGiven.Contains(audienceNeeded, StringComparer.OrdinalIgnoreCase);
        }

        public Dictionary<Feature, Func<IEnumerable<string>, bool>> GetFeatureAudienceMap()
        {
            var mapFromStorage = FeatureAudienceMapProvider.GetFeatureAudienceMapFromStorage();

            var dictionary = new Dictionary<Feature, Func<IEnumerable<string>, bool>>();
            foreach (var mapping in mapFromStorage)
            {
                var mappingParts = mapping.Split('=').Select(part => part.Trim()).ToArray();
                var key = (Feature)Enum.Parse(typeof(Feature), mappingParts[0]);
                if (!dictionary.ContainsKey(key))
                {
                    dictionary.Add(key, audiences => IsInAudience(mappingParts[1], audiences));
                }
                else
                {
                    var currentPredicate = dictionary[key];
                    if (mappingParts[1].Equals("all", StringComparison.OrdinalIgnoreCase))
                    {
                        dictionary[key] = audiences => true;
                    }
                    else
                    {
                        dictionary[key] =
                            audiences => currentPredicate(audiences) || IsInAudience(mappingParts[1], audiences);
                    }
                }
            }
            return dictionary;

        }
    }
}
