using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoadmapGenerator.API.Data;
using RoadmapGenerator.API.Models;

namespace RoadmapGenerator.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly RoadmapContext _context;

        public AuthController(RoadmapContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || user.PasswordHash != request.Password) // Simple check for demo
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // In a real app, generate JWT here. For now, return user info.
            return Ok(new
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role,
                Token = "dummy-jwt-token" // Placeholder
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "User already exists" });
            }

            var user = new User
            {
                Email = request.Email,
                PasswordHash = request.Password, // Simple storage for demo
                Role = request.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully" });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee";
    }
}
