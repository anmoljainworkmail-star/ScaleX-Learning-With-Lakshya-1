
namespace RoadmapGenerator.API.Models
{
    public class GenerateRequest
    {
        public string Query { get; set; } = string.Empty;
    }

    public class RefineRequest
    {
        public List<string> CurrentList { get; set; } = new();
        public string Instruction { get; set; } = string.Empty;
    }

    public class RoadmapResponse
    {
        public string Title { get; set; } = string.Empty;
        public List<string> Topics { get; set; } = new();
    }
}
