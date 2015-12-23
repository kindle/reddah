namespace Reddah.Web.Core.ABTesting
{
    using System;
    using Reddah.Core;

    public enum Feature
    {
        HomePageV2
    }

    public static class FeatureUtils
    {
        public static Feature Parse(string featureString)
        {
            try
            {
                return (Feature)Enum.Parse(typeof(Feature), featureString);
            }
            catch (Exception exception)
            {
                if (exception.IsFatal())
                {
                    throw;
                }

                throw new ArgumentException(string.Format("featureString: '{0}'", featureString), exception);
            }
        }
    }
}
