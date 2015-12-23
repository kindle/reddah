using System.Collections.Generic;
using System.Data.Services.Client;
using System.Linq;

using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.StorageClient;
using System;

namespace SupportWebRole
{
    public class DataProvider
    {
        private DataList _list;

        public DataProvider()
        {
            //string configValue = RoleEnvironment.GetConfigurationSettingValue("DataConnectionString");
            //var account = CloudStorageAccount.Parse(configValue);
            const string accountName = "reachusersubsms";
            const string accountKey = "mZsE1v3NLbnUI74Lsd3Z9ffgneZelmAEZXPxID5kYzH/JfZN1oZxPFKV3Fc25MiDqZMTxWkIfzqiiijZWcZctQ==";
            var account = new CloudStorageAccount(new StorageCredentialsAccountAndKey(accountName, accountKey), false);

            _list = new DataList(account.TableEndpoint.ToString(), account.Credentials);
        }

        public List<DataItem> GetItems(RequestData requestData)
        {
            var results = from entity in _list.Items
                            where entity.ServiceID == requestData.Item1
                            select entity;

            var list = new List<DataItem>();
            foreach (var item in results)
            {
                list.Add(item);
            }
 
            return list;
        }

        public List<string> GetDistinctItemsByLocale(RequestData requestData)
        {
            var results = from entity in _list.Items
                          where entity.Locale == requestData.Item1
                          select entity;

            var list = new List<string>();
            foreach (var item in results)
            {
                if (!list.Contains(item.ServiceID))
                    list.Add(item.ServiceID);
            }

            return list;
        }

        public void AddItem(RequestData requestData)
        {
            _list.AddObject("NotificationBoard", new DataItem(requestData));
            _list.SaveChanges();
        }

        public void DeleteItem(RequestData requestData)
        {
            var entity = (from i in _list.Items
                          where i.PartitionKey == requestData.Item1
                            && i.RowKey == requestData.Item2
                            select i).Single();
 
            _list.DeleteObject(entity);
            _list.SaveChanges();
        }
    }

    public class DataItem : TableServiceEntity
    {
        public string ServiceID { get; set; }
        public string ServiceType { get; set; }
        public string Locale { get; set; }
        public string UserID { get; set; }
        public string PhoneNumber { get; set; }
        public string Type { get; set; }
        public string Source { get; set; }

        public DataItem()
        {
        }

        public DataItem(RequestData requestData)
        {
            this.ServiceID = requestData.Item1;
            this.ServiceType = requestData.Item2;
            this.Locale = requestData.Item3;
            this.UserID = requestData.Item4;
            this.PhoneNumber = requestData.Item5;
            this.Type = requestData.Item6;
            this.Source = requestData.Item7;

            base.PartitionKey = DateTime.UtcNow.ToString("MMddyyyy");
            base.RowKey = string.Format("{0:10}_{1}", DateTime.MaxValue.Ticks - DateTime.Now.Ticks, Guid.NewGuid());
        }
    }

    public class DataList : TableServiceContext
    {
        public DataList(string baseAddress, StorageCredentials storageCredentials)
            : base(baseAddress, storageCredentials)
        {
            
        }
        public DataServiceQuery<DataItem> Items
        {
            get { return this.CreateQuery<DataItem>("NotificationBoard"); }
        }
    }
}