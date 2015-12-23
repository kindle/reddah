namespace Reddah.Web.Core.ABTesting
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Linq;
    using Reddah.Core;
    using Reddah.Core.IoC;

    [SingletonInstance]
    public class TagUsageCache : ITagUsageCache
    {
        private readonly Hashtable pathHashTable = new Hashtable(StringComparer.OrdinalIgnoreCase);
        private readonly object dummyLoad = new object();

        public void AddTagsUsedForPath(string siteRelativeContentItemPath, IEnumerable<string> tagsToAdd)
        {
            if (!pathHashTable.ContainsKey(siteRelativeContentItemPath))
            {
                lock (pathHashTable.SyncRoot)
                {
                    if (!pathHashTable.ContainsKey(siteRelativeContentItemPath)) // Check again within the lock
                    {
                        pathHashTable[siteRelativeContentItemPath] = new Hashtable(
                            tagsToAdd.ToDictionary(t => t, t => dummyLoad),
                            StringComparer.OrdinalIgnoreCase);
                        return;
                    }
                }
            }

            var usedTagsHashTable = (Hashtable)pathHashTable[siteRelativeContentItemPath];
            if (tagsToAdd.Any(u => !usedTagsHashTable.ContainsKey(u)))
            {
                lock (usedTagsHashTable.SyncRoot)
                {
                    var newTags = tagsToAdd.Where(t => !usedTagsHashTable.ContainsKey(t)).ToArray();
                    newTags.ForEach(t => usedTagsHashTable.Add(t, dummyLoad));
                }
            }
        }

        public IEnumerable<string> GetTagsUsedForPath(string siteRelativeContentItemPath)
        {
            if (!pathHashTable.ContainsKey(siteRelativeContentItemPath))
            {
                return new string[0];
            }

            return ((Hashtable)pathHashTable[siteRelativeContentItemPath]).Keys.Cast<string>();
        }

        public IEnumerable<string> GetIntersectOfTagsUsedForPath(string siteRelativeContentItemPath, IEnumerable<string> tags)
        {
            if (!pathHashTable.ContainsKey(siteRelativeContentItemPath))
            {
                return new string[0];
            }

            var usedTagsHashTable = (Hashtable)pathHashTable[siteRelativeContentItemPath];
            return tags.Where(usedTagsHashTable.ContainsKey);
        }
    }
}
