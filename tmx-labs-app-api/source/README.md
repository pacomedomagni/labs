# TMX Labs API

ASP.NET Core 8 API for telematics lab management system.

## Architecture Overview

```
Telematics.Labs.Api/                    # Controllers, Request/Response Models, Mappers
    ??? Controllers/{Feature}/
    ??? RequestModels/{Feature}/
    ??? ResponseModels/{Feature}/
    ??? Mappers/

Telematics.Labs.Business/               # Orchestrators, Business Mappers
    ??? Orchestrators/{Feature}/
    ??? Mappers/

Telematics.Labs.Business.Resources/     # Domain Models, Enums
    ??? Domain/{Feature}/
    ??? Resources/{Feature}/            # Legacy response models
    ??? Enums/

Telematics.Labs.Services/               # Data Access, External Services
    ??? Database/
    ?   ??? Models/{Feature}/           # DAL Entities
    ??? Wcf/
    ??? Api/

Telematics.Labs.Shared/                 # Cross-cutting Concerns
```

## Model Organization Pattern

The API uses a **full separation pattern** between API contracts and domain models:

| Layer | Location | Naming Convention |
|-------|----------|-------------------|
| API Request | `Api/RequestModels/` | `*Request` |
| API Response | `Api/ResponseModels/` | `*Response` (extends `Resource`) |
| Domain | `Business.Resources/Domain/` | No suffix |
| DAL | `Services/Database/Models/` | `*Entity`, `*DataModel` |

### Data Flow

```
READ:   Database ? DAL Entity ? Domain Model ? API Response ? Client
WRITE:  Client ? API Request ? Domain Model ? DAL Params ? Database
```

### Quick Example

```csharp
[HttpPost("SaveDeviceAssignments")]
public async Task<ActionResult<SaveDeviceAssignmentsResponse>> SaveDeviceAssignments(
    [FromBody] SaveDeviceAssignmentsRequest request)
{
    var command = request.ToDeviceAssignmentCommand();           // API ? Domain
    var result = await _orchestrator.SaveDeviceAssignmentsV2(command);  // Business logic
    var response = result.ToSaveDeviceAssignmentsResponse();     // Domain ? API
    return Ok(response);
}
```

## Documentation

| Document | Description |
|----------|-------------|
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | AI coding assistant instructions with patterns and conventions |
| [`Business.Resources/MODEL_ORGANIZATION.md`](Telematics.Labs.Business.Resources/MODEL_ORGANIZATION.md) | Detailed model organization strategy and migration guide |

## Getting Started

### Prerequisites

- .NET 8 SDK
- Visual Studio 2022 or VS Code with C# extension

### Build

```bash
dotnet build
```

### Run

```bash
dotnet run --project Telematics.Labs.Api
```

## Key Conventions

- **Service Registration**: Use `[ScopedService]`, `[SingletonService]`, `[TransientService]` attributes
- **Error Handling**: Use `response.AddMessage(MessageCode.Error, message)` via `Resource` base class
- **Logging**: Use centralized `LoggingEvents` with EventIDs

## Contributing

See the [copilot instructions](.github/copilot-instructions.md) for coding patterns and conventions.




