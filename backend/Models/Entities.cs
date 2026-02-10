
using System.ComponentModel.DataAnnotations;

namespace RoadmapGenerator.API.Models
{
    public class Roadmap
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? AssignedToUserId { get; set; }
        public User? AssignedToUser { get; set; }
        public List<Topic> Topics { get; set; } = new();
    }

    public class Topic
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RoadmapId { get; set; }
        public string Content { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsCompleted { get; set; }
    }
}
