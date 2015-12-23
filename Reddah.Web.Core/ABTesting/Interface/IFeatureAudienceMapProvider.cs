namespace Reddah.Web.Core.ABTesting
{
    using System.Collections.Generic;

    public interface IFeatureAudienceMapProvider
    {
        IEnumerable<string> GetFeatureAudienceMapFromStorage();
    }
}
