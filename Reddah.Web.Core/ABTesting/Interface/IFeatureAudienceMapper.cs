namespace Reddah.Web.Core.ABTesting
{
    using System;
    using System.Collections.Generic;

    public interface IFeatureAudienceMapper
    {
        Dictionary<Feature, Func<IEnumerable<string>, bool>> GetFeatureAudienceMap();
    }
}
