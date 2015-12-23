namespace Reddah.Web.Core.ABTesting
{
    using System.Collections.Generic;
    using System.Linq;

    public class ABTestingFeatureAudienceMapProvider : IFeatureAudienceMapProvider
    {
        private readonly IABTestingParametersProvider parametersProvider;

        public ABTestingFeatureAudienceMapProvider(IABTestingParametersProvider parametersProvider)
        {
            this.parametersProvider = parametersProvider;
        }

        public IEnumerable<string> GetFeatureAudienceMapFromStorage()
        {
            ABTestingParameters parameters = this.parametersProvider.GetABTestingParameters();

            return
                parameters.FeaturesAudiencesMap.Select(
                    parameter => string.Format("{0} = {1}", parameter.Key, parameter.Value)).ToArray();
        }
    }
}
