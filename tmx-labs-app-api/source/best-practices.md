# Constistent Error Handling and Messaging in API Responses

## Status
Accepted

## Context
Need to provide consistent error handling and messaging for API responses.

## Decision
Error responses from APIs should follow a standardized format that includes an error code, message, and optional details.

## Consequences
This ensures that clients can reliably parse and handle errors.

### ✅Do
EventIDs should be constants defined in a centralized location.
...\tmx-labs-app-api\source\Telematics.Labs.Shared\LoggingEvents.cs

        public static EventId CustomerSearchOrchestrator_Seach_Error = 4003;
        public static EventId AccountOrchestrator_GetAccounts_Error = 4004;
        public static EventId UpdateCustomerOrchestrator_Update_Error = 4005;

Error responses should follow a consistent structure and contain relevant information such as "ParticpantGroupID, DeviceID, etc".
Add error messages to the response instead of swallowing exceptions
### ✅Do
        ```csharp
            catch (Exception ex)
            {
                _logger.LogError(LoggingEvents.UpdateCustomerOrchestrator_Update_Error, ex, 
                "Failed updating user information for ParticipantGroupSeqID: {ParticipantGroupSeqID}", request.Customer.ParticipantGroup.ParticipantGroupSeqID);
                response.AddMessage(MessageCode.ErrorCode, "Failed updating user information for ParticipantGroupSeqID:" + request.Customer.ParticipantGroup.ParticipantGroupSeqID);
                response.AddMessage(MessageCode.ErrorDetails, ex.Message);
                if (ex.StackTrace != null)
                {
                    response.AddMessage(MessageCode.StackTrace, ex.StackTrace);
                }
            }
        ```
### ❌Don't
        ```csharp
            catch (Exception ex)
            {
                _logger.LogError(LoggingEvents.UpdateCustomerOrchestrator_Update_Error, ex, 
                "Failed updating user information for ParticipantGroupSeqID: {ParticipantGroupSeqID}", request.Customer.ParticipantGroup.ParticipantGroupSeqID);
            }
        ```