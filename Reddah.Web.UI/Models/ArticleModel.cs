using System.ComponentModel.DataAnnotations;
namespace Reddah.Web.UI.Models
{
    public class ArticlePreview
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public string ArticleUrl { get; set; }
        public int Count { get; set; }
        public int Up { get; set; }
        public int Down { get; set; }
        public int Comments { get; set; }
        public string Abstract { get; set; }
        public string CreatedOn { get; set; }
        public string UserName { get; set; }
        public string GroupName { get; set; }
        public string Content { get; set; }
    }

    public class VoteModel {

        [Required]
        [Display(Name = "Article Id")]
        public int ArticleId { get; set; }

        [Required]
        [Display(Name = "Vote Value")]
        public string Value { get; set; }
    }
}