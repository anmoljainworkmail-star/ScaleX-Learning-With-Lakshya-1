using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoadmapGenerator.API.Data;

namespace RoadmapGenerator.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly RoadmapContext _context;

        public UserController(RoadmapContext context)
        {
            _context = context;
        }

        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            var employees = await _context.Users
                .Where(u => u.Role == "Employee")
                .Select(u => new { u.Id, u.Email })
                .ToListAsync();

            return Ok(employees);
        }
    }
}
