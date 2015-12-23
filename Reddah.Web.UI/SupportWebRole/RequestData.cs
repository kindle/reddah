using System.Runtime.Serialization;

namespace SupportWebRole
{
    [DataContract(Namespace = "http://support/service")]
    public class RequestData
    {
        [DataMember]
        public string Item0 { get; set; }

        [DataMember]
        public string Item1 { get; set; }

        [DataMember]
        public string Item2 { get; set; }

        [DataMember]
        public string Item3 { get; set; }

        [DataMember]
        public string Item4 { get; set; }

        [DataMember]
        public string Item5 { get; set; }

        [DataMember]
        public string Item6 { get; set; }

        [DataMember]
        public string Item7 { get; set; }
    }
}