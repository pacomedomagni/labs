# LabConfigSettings Structure Overview

## Configuration Hierarchy

The `LabConfigSettings` follows a hierarchical structure that matches the existing `appsettings.json` format:

```
LabConfigSettings
└── Servers
    ├── Test
    │   ├── Name (string)
    │   ├── Slot (string)
    │   ├── ApplicationCode (int)
    │   └── ApplicationName (string)
    └── ConfigKeys (Dictionary<string, string>)
```

## JSON Structure (appsettings.json)

```json
"LabConfigSettings": {
  "Servers": {
    "Test": {
      "Name": "SCUBITW0",
      "Slot": "NoSlot",
      "ApplicationCode": 1000,
      "ApplicationName": "TMXLabsApp"
    },
    "ConfigKeys": {
      "CodeTableExpiration": "CodeTableManagerExpirationSeconds"
    }
  }
}
```

## Class Structure

### LabConfigSettings
Main configuration class containing the entire hierarchy.

**Properties:**
- `Servers` (ServersConfig): Container for server configurations and key mappings

### ServersConfig
Contains server information and configuration key mappings.

**Properties:**
- `Test` (ServerInfo): Test server configuration details
- `ConfigKeys` (Dictionary<string, string>): Mappings between friendly names and actual config keys

### ServerInfo
Individual server configuration details.

**Properties:**
- `Name` (string): Server name (e.g., "SCUBITW0")
- `Slot` (string): Deployment slot name (e.g., "NoSlot")
- `ApplicationCode` (int): Application identifier code (e.g., 1000)
- `ApplicationName` (string): Application name (e.g., "TMXLabsApp")

## Purpose of Each Component

### Servers.Test
Holds the primary server configuration that the application will use to connect to the WCF AppConfig service.

### Servers.ConfigKeys
Provides a mapping layer between friendly configuration names and their actual keys. This allows:
- **Abstraction**: Use friendly names like "CodeTableExpiration" instead of the full key
- **Flexibility**: Change underlying key names without affecting code
- **Clarity**: Self-documenting configuration mappings

## Usage Examples

### Accessing Server Information
```csharp
var serverName = _configSettings.ServerName; // "SCUBITW0"
var appCode = _configSettings.ApplicationCode; // 1000
var appName = _configSettings.ApplicationName; // "TMXLabsApp"
var slot = _configSettings.SlotName; // "NoSlot"
```

### Using Config Key Mappings
```csharp
// Get the actual key from the friendly name
var actualKey = _configSettings.GetConfigKeyMapping("CodeTableExpiration");
// Returns: "CodeTableManagerExpirationSeconds"

// Now retrieve the value using the actual key
var value = await _configSettings.GetConfigValueAsync(actualKey);
```

### Retrieving Remote Configuration
```csharp
// Gets configuration from WCF service using ApplicationCode
var config = await _configSettings.GetServerConfigurationAsync();

// Gets configuration from WCF service using ApplicationName
var config = await _configSettings.GetServerConfigurationByNameAsync();
```

## Extension Points

The structure can be extended to support multiple environments:

```json
"LabConfigSettings": {
  "Servers": {
    "Test": { /* test server config */ },
    "Development": { /* dev server config */ },
    "Production": { /* prod server config */ },
    "ConfigKeys": { /* shared mappings */ }
  }
}
```

This would allow selecting different server configurations based on environment without code changes.
