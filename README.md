"DateTimeControlComponent is a composite control combining:
 
Date picker + Time picker (two separate ngModel inputs)
Unified validation across both fields
Single error display for both inputs combined
It's used via dialog (DateTimeEditorComponent)
 
Not directly embedded in forms
Returns formatted ISO date string
Parent forms use hidden inputs with their own validators
Why mat-error won't work here:
 
mat-error requires a single FormControl
This component has two separate inputs (date + time)
Needs one unified error message spanning both
Uses template-driven forms, not Reactive Forms
The Custom Validation Code is Necessary:
they're required because:
 
Validates format of TWO separate inputs as they type
Combines them into one Date object
Shows a single error below both fields
No FormControl, so mat-error infrastructure doesn't apply"

Enter an invalid date format (e.g., "32132026") or an invalid time format (e.g., "25:61") in the start or end date/time fields. The system should display a clear validation error message indicating the specific issue with the entered date or time format (e.g., "Invalid date format. Please use MM/DD/YYYY.") && (Time e.g., HH:MM AM/PM) Now here is the issue it mostly when we are inputing these manually he want the validation to be triggred right at the 3rd character input if the validation is not respected. For example Date 012 => validation error should trigger right away.

est Intent: Validate that the OK button in the modal is disabled when there is validation errors present, preventing users from submitting invalid data.

Steps to Recreate:

Open the relevant modal (e.g., Range Start/End Date modal).
Enter invalid data in one or more required fields (e.g., incorrect date or time format).
Observe the error message displayed for the invalid input.
Attempt to click the OK button.
Expected Results: The OK button should remain disabled when there are validation errors, preventing the user from proceeding until all errors are resolved.

Actual Results: The OK button remains enabled even when validation errors are present, allowing the user to submit the form with invalid data. It displays two different errors in the background not in the modal
Test Intent: Validate that the Range Start/End Date modal provides clear validation error messages when users enter invalid date or time formats.

Steps to Recreate:

Open the Range Start/End Date modal.
Enter an invalid date format (e.g., "32132026") or an invalid time format (e.g., "25:61") in the start or end date/time fields.
Attempt to submit or save the modal.
Observe the system response.
Expected Results: The system should display a clear validation error message indicating the specific issue with the entered date or time format (e.g., "Invalid date format. Please use MM/DD/YYYY.") && (Time e.g., HH:MM AM/PM)

Actual Results: The input fields are only highlighted in red, with no error message displayed. It is unclear to the user whether the red highlight indicates an error or another status.