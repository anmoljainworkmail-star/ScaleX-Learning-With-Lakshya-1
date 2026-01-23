using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using RoadmapGenerator.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Database (SQL Server)
builder.Services.AddDbContext<RoadmapContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev",
        policy => policy.WithOrigins("http://localhost:4200")
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});


var groqModelId = builder.Configuration["Groq:ModelId"];
var groqApiKey = builder.Configuration["Groq:ApiKey"];
var groqEndpoint = builder.Configuration["Groq:Endpoint"];

if (!string.IsNullOrWhiteSpace(groqApiKey))
{
    builder.Services.AddKernel();

    builder.Services.AddOpenAIChatCompletion(
        modelId: groqModelId,
        apiKey: groqApiKey,
        endpoint: new Uri(groqEndpoint)
    );
}

if (!string.IsNullOrWhiteSpace(groqApiKey))
{
    builder.Services.AddKernel();

   builder.Services.AddOpenAIChatCompletion(
      modelId: groqModelId,
      apiKey : groqApiKey,
      endpoint : new Uri(groqEndpoint)
    );
}



var app = builder.Build();

// HTTP pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularDev");
app.MapControllers();

app.Run();
