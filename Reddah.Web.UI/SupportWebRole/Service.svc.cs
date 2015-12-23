using System;
using System.ServiceModel;
using System.ServiceModel.Web;

namespace SupportWebRole
{
    [ServiceContract]
    public class Service
    {
        private DataProvider _data;

        public Service()
        {
            _data = new DataProvider();
        }

        //[OperationContract]
        //[WebInvoke(UriTemplate = "/list/{owner}", Method = "GET", RequestFormat = WebMessageFormat.Xml)]
        //public List<string> GetItems(string owner)
        //{
        //    return _data.GetItems(owner);
        //}

        //[OperationContract]
        //[WebInvoke(UriTemplate = "/list/{owner}", Method = "POST", RequestFormat = WebMessageFormat.Xml)]
        //public void AddItem(string owner, string item)
        //{
        //    _data.AddItem(owner, item);
        //}

        //[OperationContract]
        //[WebInvoke(UriTemplate = "/list/{owner}/{item}", Method = "DELETE")]
        //public void DeleteItem(string owner, string item)
        //{
        //    _data.DeleteItem(owner, item);
        //}

        [OperationContract]
        [WebInvoke(Method = "POST",
            ResponseFormat = WebMessageFormat.Xml,
            RequestFormat = WebMessageFormat.Xml,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "Add")]
        public ResponseData Add(RequestData requestData)
        {
            var responseData = new ResponseData();

            // verify token
            if(requestData.Item0.Equals("0cja8h6EtyDH"))
            {
                // update source
                requestData.Item7 = "source";

                try
                {
                    _data.AddItem(requestData);
                    responseData.Result = "Success";
                }
                catch (Exception e)
                {
                    responseData.Result = e.Message;
                }
            }
            else
            {
                responseData.Result = "Wrong Token";
            }

            return responseData;
        }

        [OperationContract]
        [WebInvoke(Method = "POST",
            ResponseFormat = WebMessageFormat.Xml,
            RequestFormat = WebMessageFormat.Xml,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "Delete")]
        public ResponseData Delete(RequestData requestData)
        {
            var responseData = new ResponseData();

            // verify token
            if (requestData.Item0.Equals("0cja8h6EtyDH"))
            {
                try
                {
                    _data.DeleteItem(requestData);
                    responseData.Result = "Success";
                }
                catch (Exception e)
                {
                    responseData.Result = e.Message;
                }
            }
            else
            {
                responseData.Result = "Wrong Token";
            }

            return responseData;
        }

        [OperationContract]
        [WebInvoke(Method = "POST",
            ResponseFormat = WebMessageFormat.Xml,
            RequestFormat = WebMessageFormat.Xml,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetItemsByServiceId")]
        public ResponseData GetItemsByServiceId(RequestData requestData)
        {
            var responseData = new ResponseData();

            // verify token
            if (requestData.Item0.Equals("0cja8h6EtyDH"))
            {
                // update source
                requestData.Item7 = "source";

                try
                {
                    responseData.List = _data.GetItems(requestData);
                    responseData.Result = "Success";
                }
                catch (Exception e)
                {
                    responseData.Result = e.Message;
                }
            }
            else
            {
                responseData.Result = "Wrong Token";
            }

            return responseData;
        }

        [OperationContract]
        [WebInvoke(Method = "POST",
            ResponseFormat = WebMessageFormat.Xml,
            RequestFormat = WebMessageFormat.Xml,
            BodyStyle = WebMessageBodyStyle.Bare,
            UriTemplate = "GetDistinctServiceIDsByLocale")]
        public ResponseData GetDistinctServiceIDsByLocale(RequestData requestData)
        {
            var responseData = new ResponseData();

            // verify token
            if (requestData.Item0.Equals("0cja8h6EtyDH"))
            {
                // update source
                requestData.Item7 = "source";

                try
                {
                    responseData.DistinctServiceIDList = _data.GetDistinctItemsByLocale(requestData);
                    responseData.Result = "Success";
                }
                catch (Exception e)
                {
                    responseData.Result = e.Message;
                }
            }
            else
            {
                responseData.Result = "Wrong Token";
            }

            return responseData;
        }
    }
}
