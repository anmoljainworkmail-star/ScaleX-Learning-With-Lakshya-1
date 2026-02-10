using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using RoadmapGenerator.API;
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
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});


var groqModelId = builder.Configuration["Groq:ModelId"];
var groqApiKey = builder.Configuration["Groq:ApiKey"];
var groqEndpoint = builder.Configuration["Groq:Endpoint"];

try
{
    if (!string.IsNullOrWhiteSpace(groqApiKey) && !string.IsNullOrWhiteSpace(groqEndpoint))
    {
        builder.Services.AddKernel();

        builder.Services.AddOpenAIChatCompletion(
            modelId: groqModelId!,
            apiKey: groqApiKey,
            endpoint: new Uri(groqEndpoint)
        );
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Warning: Failed to initialize Semantic Kernel: {ex.Message}");
}




var app = builder.Build();

// HTTP pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngularDev");
app.UseHttpsRedirection();
app.MapControllers();

// Ensure Database is Created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<RoadmapContext>();
    context.Database.EnsureCreated();

    // SQL Server specific schema update for existing database
    try 
    {
        context.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Topics]') AND name = 'IsCompleted')
            BEGIN
                ALTER TABLE [Topics] ADD [IsCompleted] BIT NOT NULL DEFAULT 0;
            END
        ");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Schema update warning: {ex.Message}");
    }

    // Seed initial users
    await SeedUsers.SeedDatabase(context);
}

app.Run();
