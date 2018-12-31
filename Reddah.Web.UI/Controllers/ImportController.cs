namespace Reddah.Web.UI.Controllers
{
    using System.Linq;
    using System.Web.Mvc;
    using System.IO;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Linq;
    using System.Text;
    using Reddah.Web.UI.Utility;
    using System.Data.Entity.Validation;
    using Reddah.Web.UI.Filters;

    /// <summary>
    /// localonly usage: localhost:2345/import
    /// </summary>
    public class ImportController : Controller
    {
        [Local]
        public void index(int pw)
        {
            if (pw != 37)
                return;

            //tang_author();
            //song_author(1);
            //song_author(2);
            /*for(int i=start+1000;i<=57000;i+=1000)
            {
                tang_data(i);
            }*/
            /*for (int i = 41000; i <= 57000; i += 1000)
            {
                tang_data(i);
            }*/

            //tang_data(15000);
            //fix3();

            /*for (int i = 2000; i <= 254000; i += 1000)
            {
                song_data(i);
            }*/


            /*for (int i = 126000; i <= 254000; i += 1000)
            {
                song_data(i);
            }*/

            //shijing_data();
            //lunyu_data();

            /*for (int i = 0; i <= 21000; i += 1000)
            {
                ci_data(i);
            }*/
            //254000
            /*for (int i = 217000; i <= 254000; i += 1000)
            {
                song_data(i);
            }*/

        }



        //5mins for 1k peoms
        public void song_data(int n)
        {
            string jsonfile = HttpContext.Server.MapPath("~/Content/poem/poet.song." + n.ToString() + ".json");

            FileStream fs = new FileStream(jsonfile, FileMode.Open, FileAccess.Read);

            using (StreamReader file = new StreamReader(fs, Encoding.UTF8))
            {
                using (JsonTextReader reader = new JsonTextReader(file))
                {
                    JArray ja = (JArray)JToken.ReadFrom(reader);
                    int i = 0;
                    using (var db = new reddahEntities1())
                    {
                        try
                        {
                            foreach (JObject e in ja)
                            {
                                i++;
                                
                                var p = new Article();
                                p.Title = Helpers.ToSimplified(e["title"].ToString());
                                p.GroupName = Helpers.ToSimplified("诗词,宋," + e["author"].ToString());
                                JArray njap = (JArray)e["paragraphs"];
                                var njapt = njap.ToString().Replace("[", "").Replace("]", "").Replace("\",", "").Replace("\"", "").Replace("\r\n", "<br>");
                                p.Content = Helpers.ToSimplified(Helpers.HtmlEncode("<div class=\"poetry\">" + njapt + "</div>"));
                                JArray njas = (JArray)e["strains"];
                                var njast = njas.ToString().Replace("[", "").Replace("]", "").Replace("\",", "").Replace("\"", "").Replace("\r\n", "<br>");
                                p.Abstract = Helpers.ToSimplified(Helpers.HtmlEncode(njast));
                                p.Locale = "zh-cn";
                                p.CreatedOn = System.DateTime.Now;
                                p.UserName = "wind";

                                if (e["tags"] != null)
                                    p.GroupName += Helpers.ToSimplified("," + e["tags"].ToString().Replace("[", "").Replace("]", "").Replace("\"", "").Replace(" ", "").Replace("\r\n", ""));

                                db.Articles.Add(p);
                                

                            }

                            System.Diagnostics.Debug.WriteLine("start: " + n.ToString() + " " + System.DateTime.Now.ToString("F") + "...");
                            db.SaveChanges();
                            System.Diagnostics.Debug.WriteLine("completed: " + n.ToString() + " " + System.DateTime.Now.ToString("F") + "...");
                        }
                        catch (DbEntityValidationException ex)
                        {
                            System.Console.WriteLine(ex.Message + i + n);
                        }
                    }


                }
            }
        }

        //5mins for 1k peoms
        public void tang_data(int n)
        {
            string jsonfile = HttpContext.Server.MapPath("~/Content/poem/poet.tang." + n.ToString() + ".json");

            FileStream fs = new FileStream(jsonfile, FileMode.Open, FileAccess.Read);

            using (StreamReader file = new StreamReader(fs, Encoding.UTF8))
            {
                using (JsonTextReader reader = new JsonTextReader(file))
                {
                    JArray ja = (JArray)JToken.ReadFrom(reader);
                    int i = 0;
                    using (var db = new reddahEntities1())
                    {
                        try
                        {
                            foreach (JObject e in ja)
                            {
                                i++;
                                //if (i < 100) { 
                                var p = new Article();
                                p.Title = Helpers.ToSimplified(e["title"].ToString());
                                p.GroupName = Helpers.ToSimplified("诗词,唐," + e["author"].ToString());
                                JArray njap = (JArray)e["paragraphs"];
                                var njapt = njap.ToString().Replace("[", "").Replace("]", "").Replace("\",", "").Replace("\"", "").Replace("\r\n", "<br>");
                                p.Content = Helpers.ToSimplified(Helpers.HtmlEncode("<div class=\"poetry\">" + njapt + "</div>"));
                                JArray njas = (JArray)e["strains"];
                                var njast = njas.ToString().Replace("[", "").Replace("]", "").Replace("\",", "").Replace("\"", "").Replace("\r\n", "<br>");
                                p.Abstract = Helpers.ToSimplified(Helpers.HtmlEncode(njast));
                                p.Locale = "zh-cn";
                                p.CreatedOn = System.DateTime.Now;
                                p.UserName = "wind";

                                if (e["tags"] != null)
                                    p.GroupName += Helpers.ToSimplified("," + e["tags"].ToString().Replace("[", "").Replace("]", "").Replace("\"", "").Replace(" ", "").Replace("\r\n", ""));

                                db.Articles.Add(p);
                                //}

                            }
                            
                            System.Diagnostics.Debug.WriteLine("start: " + n.ToString() +" "+ System.DateTime.Now.ToString("F") + "...");
                            db.SaveChanges();
                            System.Diagnostics.Debug.WriteLine("completed: " + n.ToString() + " " + System.DateTime.Now.ToString("F") + "...");
                        }
                        catch (DbEntityValidationException ex)
                        {
                            System.Console.WriteLine(ex.Message + i + n);
                        }
                    }


                }
            }
        }
        public void fix3()
        {
            using (var db = new reddahEntities1())
            {
                try
                {
                    var customers = db.Articles.Where(c => c.Id <= 4000);
                    int i = 0;
                    foreach (var c in customers)
                    {
                        i++;
                        c.Title = Helpers.ToSimplified(c.Title);
                        c.Content = Helpers.ToSimplified(c.Content);
                        c.Abstract = Helpers.ToSimplified(c.Abstract);
                        c.GroupName = Helpers.ToSimplified(c.GroupName);
                    }
                    System.Diagnostics.Debug.WriteLine("start: " + System.DateTime.Now.ToString("F") + "...");
                    db.SaveChanges();
                    System.Diagnostics.Debug.WriteLine("completed: " + System.DateTime.Now.ToString("F") + "...");
                }
                catch (DbEntityValidationException ex)
                {
                    System.Console.WriteLine(ex.Message);
                }
            }
        }
        public void fix2()
        {
            using (var db = new reddahEntities1())
            {
                try
                {
                    var customers = db.Articles.Where(c => c.Id <= 4000 &&c.GroupName.Contains("唐三百首"));
                    int i = 0;
                    foreach (var customer in customers)
                    {
                        i++;
                        customer.GroupName = customer.GroupName.Replace("唐三百首", "唐诗三百首");
                    }
                    
                    db.SaveChanges();
                }
                catch (DbEntityValidationException ex)
                {
                    System.Console.WriteLine(ex.Message);
                }
            }
        }
        public void fix1()
        {
            using (var db = new reddahEntities1())
            {
                /*for (int i = 176; i <= 7175; i++)
                {
                    var org = db.Articles.FirstOrDefault(x => x.Id == i).GroupName;
                    db.Articles.FirstOrDefault(x => x.Id == i).GroupName = "诗词," + org;
                }*/
                try
                {
                    var customers = db.Articles.Where(c => c.Id >= 6001);
                    int i = 0;
                    foreach (var customer in customers)
                    {
                        i++;
                        customer.GroupName = "诗词," + customer.GroupName;
                    }

                    db.SaveChanges();
                }
                catch (DbEntityValidationException ex)
                {
                    System.Console.WriteLine(ex.Message);
                }
            }
        }

        //30ms
        public void tang_author()
        {
            string jsonfile = HttpContext.Server.MapPath("~/Content/poem/authors.tang.json");

            FileStream fs = new FileStream(jsonfile, FileMode.Open, FileAccess.Read);

            using (StreamReader file = new StreamReader(fs, Encoding.UTF8))
            {
                using (JsonTextReader reader = new JsonTextReader(file))
                {
                    JArray ja = (JArray)JToken.ReadFrom(reader);
                    int i = 0;
                    using (var db = new reddahEntities1())
                    {
                        try
                        {
                            foreach (JObject e in ja)
                            {
                                var name = Helpers.ToSimplified(e["name"].ToString());
                                var desc = Helpers.ToSimplified(e["desc"].ToString());

                                if (!string.IsNullOrWhiteSpace(desc) && db.Groups.FirstOrDefault(g => g.Name == name.Trim()) == null)
                                {
                                    i++;
                                    var g = new Group();
                                    g.Name = name;
                                    g.CreatedOn = System.DateTime.Now;
                                    if (!string.IsNullOrWhiteSpace(desc))
                                        g.Desc = desc;
                                    db.Groups.Add(g);
                                }
                            }
                            db.SaveChanges();
                        }
                        catch (DbEntityValidationException ex)
                        {
                            System.Console.WriteLine(ex.Message);
                        }
                    }
                    
                }
            }
        }

        //30ms*2
        public void song_author(int n)
        {
            string jsonfile = HttpContext.Server.MapPath("~/Content/poem/authors.song"+n.ToString()+".json");

            FileStream fs = new FileStream(jsonfile, FileMode.Open, FileAccess.Read);

            using (StreamReader file = new StreamReader(fs, Encoding.UTF8))
            {
                using (JsonTextReader reader = new JsonTextReader(file))
                {
                    JArray ja = (JArray)JToken.ReadFrom(reader);
                    int i = 0;
                    using (var db = new reddahEntities1())
                    {
                        try
                        {
                            foreach (JObject e in ja)
                            {
                                var name = Helpers.ToSimplified(e["name"].ToString());
                                var desc = Helpers.ToSimplified(e["desc"].ToString());

                                if (!string.IsNullOrWhiteSpace(desc) && db.Groups.FirstOrDefault(g => g.Name == name.Trim()) == null)
                                {
                                    i++;
                                    var g = new Group();
                                    g.Name = name;
                                    g.CreatedOn = System.DateTime.Now;
                                    if (!string.IsNullOrWhiteSpace(desc))
                                        g.Desc = desc;
                                    db.Groups.Add(g);
                                }
                            }
                            db.SaveChanges();
                        }
                        catch (DbEntityValidationException ex)
                        {
                            System.Console.WriteLine(ex.Message);
                        }
                    }

                }
            }
        }

        public void shijing_data()
        {
            string jsonfile = HttpContext.Server.MapPath("~/Content/poem/shijing.json");

            FileStream fs = new FileStream(jsonfile, FileMode.Open, FileAccess.Read);

            using (StreamReader file = new StreamReader(fs, Encoding.UTF8))
            {
                using (JsonTextReader reader = new JsonTextReader(file))
                {
                    JArray ja = (JArray)JToken.ReadFrom(reader);
                    int i = 0;
                    using (var db = new reddahEntities1())
                    {
                        try
                        {
                            foreach (JObject e in ja)
                            {
                                i++;

                                var p = new Article();
                                p.Title = Helpers.ToSimplified(e["chapter"].ToString() + "·" + e["section"].ToString() + "·" + e["title"].ToString());
                                p.GroupName = Helpers.ToSimplified("诗词,先秦,诗经");
                                p.GroupName += Helpers.ToSimplified(
                                    "," + e["chapter"].ToString() + "," + e["section"].ToString()
                                    );
                                JArray njap = (JArray)e["content"];
                                var njapt = njap.ToString().Replace("[", "").Replace("]", "").Replace("\",", "").Replace("\"", "").Replace("\r\n", "<br>");
                                p.Content = Helpers.ToSimplified(Helpers.HtmlEncode("<div class=\"poetry\">" + njapt + "</div>"));
                                p.Abstract = "";
                                p.Locale = "zh-cn";
                                p.CreatedOn = System.DateTime.Now;
                                p.UserName = "wind";




                                db.Articles.Add(p);


                            }

                            System.Diagnostics.Debug.WriteLine("start: " + System.DateTime.Now.ToString("F") + "...");
                            db.SaveChanges();
                            System.Diagnostics.Debug.WriteLine("completed: " + System.DateTime.Now.ToString("F") + "...");
                        }
                        catch (DbEntityValidationException ex)
                        {
                            System.Console.WriteLine(ex.Message + i);
                        }
                    }


                }
            }
        }

        public void lunyu_data()
        {
            string jsonfile = HttpContext.Server.MapPath("~/Content/poem/lunyu.json");

            FileStream fs = new FileStream(jsonfile, FileMode.Open, FileAccess.Read);

            using (StreamReader file = new StreamReader(fs, Encoding.UTF8))
            {
                using (JsonTextReader reader = new JsonTextReader(file))
                {
                    JArray ja = (JArray)JToken.ReadFrom(reader);
                    int i = 0;
                    using (var db = new reddahEntities1())
                    {
                        try
                        {
                            foreach (JObject e in ja)
                            {
                                i++;

                                var p = new Article();
                                p.Title = Helpers.ToSimplified("论语·"+e["chapter"].ToString());
                                p.GroupName = Helpers.ToSimplified("诗词,战国,孔子,论语");
                                JArray njap = (JArray)e["paragraphs"];
                                var njapt = njap.ToString().Replace("[", "").Replace("]", "").Replace("\",", "").Replace("\"", "").Replace("\r\n", "<br>");
                                p.Content = Helpers.ToSimplified(Helpers.HtmlEncode("<div class=\"poetry\">" + njapt + "</div>"));
                                p.Abstract = "";
                                p.Locale = "zh-cn";
                                p.CreatedOn = System.DateTime.Now;
                                p.UserName = "wind";




                                db.Articles.Add(p);


                            }

                            System.Diagnostics.Debug.WriteLine("start: " + System.DateTime.Now.ToString("F") + "...");
                            db.SaveChanges();
                            System.Diagnostics.Debug.WriteLine("completed: " + System.DateTime.Now.ToString("F") + "...");
                        }
                        catch (DbEntityValidationException ex)
                        {
                            System.Console.WriteLine(ex.Message + i);
                        }
                    }


                }
            }
        }

        //5mins for 1k peoms
        public void ci_data(int n)
        {
            string jsonfile = HttpContext.Server.MapPath("~/Content/poem/ci.song." + n.ToString() + ".json");

            FileStream fs = new FileStream(jsonfile, FileMode.Open, FileAccess.Read);

            using (StreamReader file = new StreamReader(fs, Encoding.UTF8))
            {
                using (JsonTextReader reader = new JsonTextReader(file))
                {
                    JArray ja = (JArray)JToken.ReadFrom(reader);
                    int i = 0;
                    using (var db = new reddahEntities1())
                    {
                        try
                        {
                            foreach (JObject e in ja)
                            {
                                i++;

                                var p = new Article();
                                
                                p.GroupName = Helpers.ToSimplified("诗词,宋," + e["author"].ToString()+",宋词," + e["rhythmic"].ToString());
                                if (e["tags"] != null)
                                    p.GroupName += Helpers.ToSimplified("," + e["tags"].ToString().Replace("[", "").Replace("]", "").Replace("\"", "").Replace(" ", "").Replace("\r\n", ""));

                                JArray njap = (JArray)e["paragraphs"];
                                var njapt = njap.ToString().Replace("[", "").Replace("]", "").Replace("\",", "").Replace("\"", "").Replace("\r\n", "<br>");
                                p.Content = Helpers.ToSimplified(Helpers.HtmlEncode("<div class=\"poetry\">" + njapt + "</div>"));


                                p.Title = Helpers.ToSimplified(e["rhythmic"].ToString() + "·" + njapt.Split('，', '。')[0].Replace("<br>","").Trim());
                                p.Abstract = "";
                                p.Locale = "zh-cn";
                                p.CreatedOn = System.DateTime.Now;
                                p.UserName = "wind";

                                
                                db.Articles.Add(p);


                            }

                            System.Diagnostics.Debug.WriteLine("start: " + n.ToString() + " " + System.DateTime.Now.ToString("F") + "...");
                            db.SaveChanges();
                            System.Diagnostics.Debug.WriteLine("completed: " + n.ToString() + " " + System.DateTime.Now.ToString("F") + "...");
                        }
                        catch (DbEntityValidationException ex)
                        {
                            System.Console.WriteLine(ex.Message + i + n);
                        }
                    }


                }
            }
        }

    }

    
}
