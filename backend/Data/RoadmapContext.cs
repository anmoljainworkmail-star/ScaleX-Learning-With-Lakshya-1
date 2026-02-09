
using Microsoft.EntityFrameworkCore;
using RoadmapGenerator.API.Models;

namespace RoadmapGenerator.API.Data
{
    public class RoadmapContext : DbContext
    {
        public RoadmapContext(DbContextOptions<RoadmapContext> options) : base(options) { }

        public DbSet<Roadmap> Roadmaps { get; set; }
        public DbSet<Topic> Topics { get; set; }
        public DbSet<User> Users { get; set; }
    }
}
