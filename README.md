Test Intent: Validate that screen readers correctly announce both success messages and error messages related to invalid date/time formats, ensuring accessibility compliance.

Steps to Recreate:

Navigate URL: https://tmx-labs-app-main-pro-tmx-labs-app-test.np.glb.pgrcloud.app/Portal
Click Customer Service >>Enter LastName/Email/DeviceId>>Click Search>>Click on a participant (if needed)
Click Actions>>Click General>> Click Exclude Trips>>Click Add>>Click external links
Enter a valid date/time and submit the form to trigger a success message.
Enter an invalid date/time format and submit the form to trigger an error message.
Use a screen reader (e.g., NVDA, JAWS, VoiceOver) to verify if the messages are announced.
Expected Results: Screen reader should announce both the success message and the invalid date/time format error message to the user.
Excluded date range added.
Excluded date range updated.
Excluded date range removed.
Invalid date format. Please use MM/DD/YYYY.
Invalid time format. Please use HH:MM AM/PM.

Actual Results: Screen reader does not announce the success message or the invalid date/time format error message.