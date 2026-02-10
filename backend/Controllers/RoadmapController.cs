
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using RoadmapGenerator.API.Models;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace RoadmapGenerator.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoadmapController : ControllerBase
    {
        private readonly IChatCompletionService _chatCompletionService;
        private readonly Kernel _kernel;
        private readonly Data.RoadmapContext _context;

        public RoadmapController(Kernel kernel, Data.RoadmapContext context)
        {
            _kernel = kernel;
            _chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();
            _context = context;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] GenerateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Query))
                return BadRequest("Query is required.");

            var prompt = $@"
You are an expert curriculum designer.
Create a step-by-step learning roadmap for the following topic: '{request.Query}'.
Return the response strictly as a JSON array of strings, where each string is a topic title.
Do not include any markdown formatting (like ```json), just the raw JSON array.
Example output: [""Introduction to Basics"", ""Advanced Concepts"", ""Project Work""]
";

            try 
            {
                var result = await _chatCompletionService.GetChatMessageContentAsync(prompt);
                var content = result.Content?.Trim();
                
                if (content.StartsWith("```json")) 
                {
                    content = content.Replace("```json", "").Replace("```", "").Trim();
                }

                var topics = JsonSerializer.Deserialize<List<string>>(content);
                return Ok(new RoadmapResponse { Topics = topics ?? new List<string>() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error generating roadmap: {ex.Message}. Ensure OpenAI API Key is configured.");
            }
        }

        [HttpPost("refine")]
        public async Task<IActionResult> Refine([FromBody] RefineRequest request)
        {
             if (request.CurrentList == null || !request.CurrentList.Any())
                return BadRequest("Current list is required.");

            var currentListJson = JsonSerializer.Serialize(request.CurrentList);
            
            var prompt = $@"
You are an expert curriculum designer.
I have a current roadmap: {currentListJson}
The user wants to refine this list with the following instruction: '{request.Instruction}'.
Update the list accordingly. You can add, remove, or rename topics.
Return the response strictly as a JSON array of strings.
Do not include any markdown formatting.
";
            
            try 
            {
                var result = await _chatCompletionService.GetChatMessageContentAsync(prompt);
                var content = result.Content?.Trim();

                if (content.StartsWith("```json")) 
                {
                    content = content.Replace("```json", "").Replace("```", "").Trim();
                }

                var topics = JsonSerializer.Deserialize<List<string>>(content);
                return Ok(new RoadmapResponse { Topics = topics ?? new List<string>() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error refining roadmap: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] RoadmapResponse request)
        {
             if (request.Topics == null || !request.Topics.Any())
                return BadRequest("Topics are required.");

            var roadmap = new Roadmap 
            { 
               Title = "Generated Roadmap", // In real app, ask user for title or derive from query
               Topics = request.Topics.Select((t, i) => new Topic { Content = t, OrderIndex = i }).ToList()
            };

            _context.Roadmaps.Add(roadmap);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = roadmap.Id }, roadmap);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var roadmap = await _context.Roadmaps
                .Include(r => r.Topics)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (roadmap == null)
                return NotFound();

            // Order topics by OrderIndex before returning
            roadmap.Topics = roadmap.Topics.OrderBy(t => t.OrderIndex).ToList();

            return Ok(roadmap);
        }

        [HttpPut("{id}/assign")]
        public async Task<IActionResult> AssignRoadmap(Guid id, [FromBody] AssignRoadmapRequest request)
        {
            var roadmap = await _context.Roadmaps.FindAsync(id);
            if (roadmap == null)
                return NotFound();

            roadmap.AssignedToUserId = request.UserId;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Roadmap assigned successfully" });
        }

        [HttpGet("assigned/{userId}")]
        public async Task<IActionResult> GetAssignedRoadmaps(int userId)
        {
            var roadmaps = await _context.Roadmaps
                .Include(r => r.Topics)
                .Where(r => r.AssignedToUserId == userId)
                .ToListAsync();

            foreach (var roadmap in roadmaps)
            {
                roadmap.Topics = roadmap.Topics.OrderBy(t => t.OrderIndex).ToList();
            }

            return Ok(roadmaps);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roadmaps = await _context.Roadmaps
                .Include(r => r.Topics)
                .ToListAsync();

            foreach (var roadmap in roadmaps)
            {
                roadmap.Topics = roadmap.Topics.OrderBy(t => t.OrderIndex).ToList();
            }

            return Ok(roadmaps);
        }
        [HttpPut("{roadmapId}/topic/{topicId}/complete")]
        public async Task<IActionResult> UpdateTopicCompletion(Guid roadmapId, Guid topicId, [FromBody] UpdateTopicCompletionRequest request)
        {
            var roadmap = await _context.Roadmaps.Include(r => r.Topics).FirstOrDefaultAsync(r => r.Id == roadmapId);
            if (roadmap == null) return NotFound("Roadmap not found");

            var targetTopic = roadmap.Topics.FirstOrDefault(t => t.Id == topicId);
            if (targetTopic == null) return NotFound("Topic not found");

            if (request.IsCompleted)
            {
                // Mark this and all previous topics as completed
                foreach (var t in roadmap.Topics.Where(t => t.OrderIndex <= targetTopic.OrderIndex))
                {
                    t.IsCompleted = true;
                }
            }
            else
            {
                // Mark this and all subsequent topics as incomplete - enforcing sequentiality
                foreach (var t in roadmap.Topics.Where(t => t.OrderIndex >= targetTopic.OrderIndex))
                {
                    t.IsCompleted = false;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Topic completion updated" });
        }
    }

    public class AssignRoadmapRequest
    {
        public int? UserId { get; set; }
    }

    public class UpdateTopicCompletionRequest
    {
        public bool IsCompleted { get; set; }
    }
}
