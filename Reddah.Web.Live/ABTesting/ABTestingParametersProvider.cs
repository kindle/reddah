namespace Reddah.Web.Live.ABTesting
{
    using System.Collections.Generic;
    using Reddah.Web.Core.ABTesting;
    
    public class ABTestingParametersProvider : IABTestingParametersProvider
    {
        public const string ABTestingParametersPath = "/ABTestingParameters";

        //public ABTestingParametersProviderFromCompass(ICosmosClient cosmosClient)
        //{
        //    this.cosmosClient = cosmosClient;
        //}

        public ABTestingParameters GetABTestingParameters()
        {
            //ContentData content = this.LoadCompassContent();
            //var featureAudiencesMap = new Dictionary<Feature, string>();

            //if (content != null)
            //{
            //    IEnumerable<PublishingField> features = content.ContentItem["FeatureList"].Items;

            //    foreach (var feature in features)
            //    {
            //        Feature featureName = FeatureUtils.Parse(feature["FeatureName"].Value);
            //        string audiences = feature["Audiences"].Value;
            //        featureAudiencesMap.Add(featureName, audiences);
            //    }
            //}

            // the following code is for test only will update it when sql or xml provider is ready
            var featureAudiencesMap = new Dictionary<Feature, string>();
            
            Feature featureName = FeatureUtils.Parse("HomePageV2");
            // valid value: Desktop, all to show v2
            string audiences = "Desktop";
            featureAudiencesMap.Add(featureName, audiences);

            return new ABTestingParameters {FeaturesAudiencesMap = featureAudiencesMap};
        }

        //private ContentData LoadCompassContent()
        //{
        //    ContentData contentData = null;

        //    try
        //    {
        //        contentData = this.cosmosClient.TryGetSiteRegionalContent(ABTestingParametersCompassPath);
        //    }
        //    catch (Exception ex)
        //    {
        //        if (ex.IsFatal())
        //        {
        //            throw;
        //        }
        //    }

        //    return contentData;

        //}
    }
}
