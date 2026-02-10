using System.ComponentModel.DataAnnotations;

namespace RoadmapGenerator.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = "Employee"; // "Manager" or "Employee"
    }
}
