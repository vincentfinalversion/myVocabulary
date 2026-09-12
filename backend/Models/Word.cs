using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("words")]
    public class Word
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("word")]
        public string WordText { get; set; } = string.Empty;

        [Column("definition")]
        public string Definition { get; set; } = string.Empty;

        [Column("character_count")]
        public int CharacterCount { get; set; }
    }
}