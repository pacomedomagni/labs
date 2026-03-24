# TMX Labs API - Copilot Instructions

## Project Overview

ASP.NET Core 8 API for telematics lab management. Uses layered architecture: API ? Business (Orchestrators) ? Services ? Database.

## API Model Organization Pattern (Full Separation)

Use **full separation** between API contracts and domain models for all new endpoints.

### Model Types & Locations

| Model Type | Location | Naming | Purpose |
|------------|----------|--------|---------|
| **API Request** | `Api/RequestModels/{Feature}/` | `*Request` | Incoming API contracts with validation |
| **API Response** | `Api/ResponseModels/{Feature}/` | `*Response` (extends `Resource`) | Outgoing API contracts |
| **Domain** | `Business.Resources/Domain/{Feature}/` | No suffix | Internal business logic |
| **DAL Entity** | `Services/Database/Models/{Feature}/` | `*Entity`, `*DataModel`, `*Params` | Database mapping |

### Controller Pattern

```csharp
// ? Full separation pattern
[HttpPost("MyEndpoint")]
public async Task<ActionResult<MyResponse>> MyEndpoint([FromBody] MyRequest request)
{
    // 1. Map API request ? Domain model
    var command = request.ToMyCommand();

    // 2. Call orchestrator with domain model
    var domainResult = await _orchestrator.MyOperation(command);

    // 3. Map domain result ? API response
    var response = domainResult.ToMyResponse();
    return Ok(response);
}

// ? Don't pass API models directly to orchestrators
var result = await _orchestrator.MyOperation(request); // Wrong
```

### Mapper Locations

| Location | Purpose |
|----------|---------|
| `Api/Mappers/` | API Request ? Domain, Domain ? API Response |
| `Business/Mappers/` | DAL Entity ? Domain, legacy Request ? Domain |

### Response Models

```csharp
// ? Inherit from Resource for consistent error reporting
public class MyResponse : Resource
{
    public bool Success { get; set; }
    public int Id { get; set; }
    // Inherited: Messages, Extenders
}

// ? Use AddMessage for errors
response.AddMessage(MessageCode.Error, "Error message here");

// ? Don't add redundant error properties
public List<string> Errors { get; set; } // Wrong - use Messages instead
```

### Adding New Endpoints

1. Create `Api/RequestModels/{Feature}/MyRequest.cs`
2. Create `Api/ResponseModels/{Feature}/MyResponse.cs` (extend `Resource`)
3. Create `Business.Resources/Domain/{Feature}/MyDomainModels.cs`
4. Create `Api/Mappers/{Feature}RequestMappers.cs`
5. Create/update `Api/Mappers/{Feature}ResponseMappers.cs`
6. Add orchestrator method returning domain model
7. Add controller action using pattern above

## Service Registration

```csharp
// ? Use attributes for automatic DI registration
[ScopedService]
public class MyService : IMyService { }

[SingletonService]
public interface IMyOrchestrator { }

[TransientService]
public class MyHelper : IMyHelper { }
```

## Error Handling

```csharp
// ? Always include context in error responses
catch (Exception ex)
{
    _logger.LogError(LoggingEvents.MyOperation_Error, ex, 
        "Operation failed for ID: {Id}", id);
    response.AddMessage(MessageCode.Error, $"Operation failed for ID: {id}");
}
```

## Orchestrator Methods

```csharp
// ? New methods return domain models
Task<DeviceAssignmentResult> SaveDeviceAssignmentsV2(DeviceAssignmentCommand command);

// Mark legacy methods as obsolete
[Obsolete("Use SaveDeviceAssignmentsV2 with domain models instead")]
Task<ConfirmDeviceAssignmentResponse> SaveDeviceAssignments(ConfirmDeviceAssignmentRequest request);
```

## Documentation

- Full pattern documentation: `Business.Resources/MODEL_ORGANIZATION.md`
- Example implementation: `FulfillmentController.SaveDeviceAssignments()`
