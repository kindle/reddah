using System;
using System.Collections.Generic;

using System.Web.Http;
using System.Linq;
using Reddah.Web.Login.Utilities;
using System.Web;
using System.Web.Hosting;
using System.IO;
using System.Web.Script.Serialization;
using Azure.Storage.Blobs;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/photo")]
    public class PhotoController : ApiBaseController
    {
        [Route("uploadazure")]
        [HttpPost]
        public IHttpActionResult UploadAzure()
        {
            var result = new PhotoResult();
            result.uploaded = false;

            string jwt = HttpContext.Current.Request["jwt"];

            if (String.IsNullOrWhiteSpace(jwt))
            {
                result.url = "No Jwt string";
                return Ok(result);
            }
                

            JwtResult jwtResult = AuthController.ValidJwt(jwt);

            if (jwtResult.Success != 0)
            {
                result.url = "Jwt invalid" + jwtResult.Message;
                return Ok(result);
            }

            
            HttpFileCollection hfc = HttpContext.Current.Request.Files;

            using (var db = new reddahEntities())
            {
                Dictionary<string, string> dict = new Dictionary<string, string>();
                foreach (string rfilename in HttpContext.Current.Request.Files)
                {
                    //upload image first
                    string guid = Guid.NewGuid().ToString().Replace("-", "");
                    string containerName = "photo";

                    HttpPostedFile upload = HttpContext.Current.Request.Files[rfilename];
                    //var fileNameKey = rfilename.Replace("_reddah_preview", "");

                    try
                    {
                        var fileFormat = upload.FileName.Substring(upload.FileName.LastIndexOf('.')).Replace(".", "");
                        var fileNameWithExt = Path.GetFileName(guid + "." + fileFormat);

                        //string connectionString = Environment.GetEnvironmentVariable("REDDAH_AZURE_STORAGE_CONNECTION_STRING");
                        BlobServiceClient blobServiceClient = new BlobServiceClient(base.GetAzureConnectionString());
                        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                        BlobClient blobClient = containerClient.GetBlobClient(fileNameWithExt);
                        //blobClient.SetAccessTier(Azure.Storage.Blobs.Models.AccessTier.Cool);
                        blobClient.Upload(upload.InputStream, false);



                        result.url = "https://reddah.blob.core.windows.net/"+ containerName + "/" + fileNameWithExt;


                        UploadFile file = new UploadFile();
                        file.Guid = guid;
                        file.Format = fileFormat;
                        file.UserName = jwtResult.JwtUser.User;
                        file.CreatedOn = DateTime.UtcNow;
                        file.GroupName = "pub";
                        file.Tag = "";
                        db.UploadFile.Add(file);
                    }
                    catch (Exception ex)
                    {
                        return Ok(new ApiResult(1, ex.Message));
                    }
                }


                db.SaveChanges();
                result.uploaded = true;
            }

            
            
            

            return Ok(result);

        }

        [Route("upload")]
        [HttpPost]
        public IHttpActionResult Upload()
        {
            var result = new PhotoResult();
            result.uploaded = false;

            string jwt = HttpContext.Current.Request["jwt"];

            if (String.IsNullOrWhiteSpace(jwt))
            {
                result.url = "No Jwt string";
                return Ok(result);
            }


            JwtResult jwtResult = AuthController.ValidJwt(jwt);

            if (jwtResult.Success != 0)
            {
                result.url = "Jwt invalid" + jwtResult.Message;
                return Ok(result);
            }


            HttpFileCollection hfc = HttpContext.Current.Request.Files;

            using (var db = new reddahEntities())
            {
                Dictionary<string, string> dict = new Dictionary<string, string>();
                foreach (string rfilename in HttpContext.Current.Request.Files)
                {
                    //upload image first
                    string guid = Guid.NewGuid().ToString().Replace("-", "");
                    string uploadedImagePath = "/uploadPhoto/";
                    string uploadImageServerPath = "~" + uploadedImagePath;

                    HttpPostedFile upload = HttpContext.Current.Request.Files[rfilename];
                    //var fileNameKey = rfilename.Replace("_reddah_preview", "");

                    try
                    {
                        var fileFormat = upload.FileName.Substring(upload.FileName.LastIndexOf('.')).Replace(".", "");
                        var fileName = Path.GetFileName(guid + "." + fileFormat);
                        var filePhysicalPath = HostingEnvironment.MapPath(uploadImageServerPath + "/" + fileName);
                        if (!Directory.Exists(HostingEnvironment.MapPath(uploadImageServerPath)))
                        {
                            Directory.CreateDirectory(HostingEnvironment.MapPath(uploadImageServerPath));
                        }
                        upload.SaveAs(filePhysicalPath);
                        var url = uploadedImagePath + fileName;
                        result.url = "https://login.reddah.com" + url;


                        UploadFile file = new UploadFile();
                        file.Guid = guid;
                        file.Format = fileFormat;
                        file.UserName = jwtResult.JwtUser.User;
                        file.CreatedOn = DateTime.UtcNow;
                        file.GroupName = "pub";
                        file.Tag = "";
                        db.UploadFile.Add(file);
                    }
                    catch (Exception ex)
                    {
                        return Ok(new ApiResult(1, ex.Message));
                    }
                }


                db.SaveChanges();
                result.uploaded = true;
            }





            return Ok(result);

        }
    }
}
