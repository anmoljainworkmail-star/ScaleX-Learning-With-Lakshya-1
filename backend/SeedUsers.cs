using Microsoft.EntityFrameworkCore;
using RoadmapGenerator.API.Data;
using RoadmapGenerator.API.Models;

namespace RoadmapGenerator.API;

public class SeedUsers
{
    public static async Task SeedDatabase(RoadmapContext context)
    {
        var users = new List<User>
        {
            new User { Email = "manager@roadmap.com", PasswordHash = "Manager123", Role = "Manager" },
            new User { Email = "employee@roadmap.com", PasswordHash = "Employee123", Role = "Employee" },
            new User { Email = "frontend.dev@roadmap.com", PasswordHash = "Frontend123", Role = "Employee" },
            new User { Email = "backend.dev@roadmap.com", PasswordHash = "Backend123", Role = "Employee" }
        };

        foreach (var user in users)
        {
            if (!await context.Users.AnyAsync(u => u.Email == user.Email))
            {
                context.Users.Add(user);
                Console.WriteLine($"✓ Seeded user: {user.Email}");
            }
        }

        await context.SaveChangesAsync();
    }
}
