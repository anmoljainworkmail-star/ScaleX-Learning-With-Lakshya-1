using Microsoft.EntityFrameworkCore;
using RoadmapGenerator.API.Data;
using RoadmapGenerator.API.Models;

namespace RoadmapGenerator.API;

public class SeedUsers
{
    public static async Task SeedDatabase(RoadmapContext context)
    {
        // Check if users already exist
        if (await context.Users.AnyAsync())
        {
            Console.WriteLine("Users already exist in database. Skipping seed.");
            return;
        }

        // Create Manager user
        var manager = new User
        {
            Email = "manager@roadmap.com",
            PasswordHash = "Manager123", // Note: This is plain text for demo purposes
            Role = "Manager"
        };

        // Create Employee user
        var employee = new User
        {
            Email = "employee@roadmap.com",
            PasswordHash = "Employee123", // Note: This is plain text for demo purposes
            Role = "Employee"
        };

        context.Users.AddRange(manager, employee);
        await context.SaveChangesAsync();

        Console.WriteLine("✓ Seeded 2 users:");
        Console.WriteLine($"  - Manager: {manager.Email} / {manager.PasswordHash}");
        Console.WriteLine($"  - Employee: {employee.Email} / {employee.PasswordHash}");
    }
}
