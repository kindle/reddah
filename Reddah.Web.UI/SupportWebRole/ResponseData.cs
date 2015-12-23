using System.Collections.Generic;
using System.Runtime.Serialization;

namespace SupportWebRole
{
    [DataContract]
    public class ResponseData
    {
        [DataMember]
        public string Result { get; set; }

        [DataMember]
        public List<DataItem> List { get; set; }

        [DataMember]
        public List<string> DistinctServiceIDList { get; set; }
    }
}