As a TMX Labs Admin, 
I need the Assign Device button on the Enrollment Success screen to take me directly to the newly enrolled participant’s order in the Device Order modal, 
So that I can assign their device immediately without additional navigation.
Background: When a TMX Labs Admin completes the Enroll New User workflow, they are shown the Enrollment Successful screen with options including Assign Device.

With the Order Fulfillment pages now available, the Assign Device button must be updated to direct users to the Order Fulfillment page and automatically open the Device Order modal for the newly enrolled participant.

This change ensures a seamless transition from enrollment to device assignment using the current fulfillment workflow.

Required user role is TMXLabs Admin (UBILABSADM-01)
Current Behavior
User completes enrollment
Enrollment Successful screen is displayed
Clicking Assign Device does not route through the Order Fulfillment experience
Required Behavior
Clicking Assign Device:
Navigates the user to the Order Fulfillment page
Automatically opens the Device Order modal
Pre‑selects the newly enrolled participant's order

Assign Device button is available after enrollment
Given a TMX Labs Admin has successfully completed the Enroll New User workflow
When the Enrollment Successful screen is displayed
Then the Assign Device button is visible and enabled

Navigation to Order Fulfillment
Given the TMX Labs Admin is on the Enrollment Successful screen
When the user clicks the Assign Device button
Then the application navigates the user to the Order Fulfillment page
And the Device Order modal opens automatically without additional user interaction
And the Order # for the given customer is displaying in the sub header
And all vehicles associated with the device order are listed
And the cursor is in the first Device Serial Number textbox
And the NEXT button is disabled



Test Intent:

Validate that all navigation tabs, specifically the "COMPLETED ORDERS" tab, are accessible via keyboard navigation to ensure compliance with accessibility standards.

Steps to Recreate:

Open the application 
Click Order Fulfillment
Attempt to navigate to the "COMPLETED ORDERS" tab using only the keyboard (e.g., Tab key, Arrow keys, Enter/Space).
Observe whether the tab receives focus and can be activated without using a mouse.
Expected Results:
The "COMPLETED ORDERS" tab should be reachable and operable using keyboard navigation alone, allowing users to switch to it without a mouse.

Actual Results:
The "COMPLETED ORDERS" tab cannot be accessed or activated using keyboard navigation; it does not receive focus or respond to keyboard events.

Business Impact:
Users who rely on keyboard navigation, including those with disabilities, are unable to access the "COMPLETED ORDERS" tab. This limits accessibility, potentially excludes users, and may result in non-compliance with accessibility regulations.


Test Intent:

Validate that all text elements on the Order Fulfillment page meet the minimum color contrast ratio required by WCAG 2.1 AA standards, ensuring readability for users with visual impairments.

Steps to Recreate:

Navigate to: https://tmx-labs-app-main-pro-tmx-labs-app-test.np.glb.pgrcloud.app/OrderFulfillment
Locate the form label elements:
"Search" (#mat-mdc-form-field-label-1 > mat-label)
"Search By" (#mat-mdc-form-field-label-0 > mat-label)
Inspect the color properties of these labels:
Foreground color: #717171
Background color: #f5f5f5
Font size: 16px (12pt), font weight: normal
Use an accessibility testing tool to measure the color contrast ratio.
Expected Results:
All text elements, including form labels, should have a color contrast ratio of at least 4.5:1 against their background, as required by WCAG 2.1 AA (1.4.3 Contrast Minimum).

Actual Results:
The "Search" and "Search By" labels have a color contrast ratio of 4.47:1 (foreground: #717171, background: #f5f5f5), which is below the required minimum of 4.5:1. This makes the text difficult to read for users with low vision or color blindness.

Test Intent:

Validate that the "Devices Needed" field in the pending order list displays a valid numeric value representing the required devices for each order.

Steps to Recreate:

Log in to the application.
Navigate to the "Pending Orders" section.
Review the "Devices Needed" field for each pending order in the list.
Expected Results:
The "Devices Needed" field should display a valid integer or numeric value for each pending order, indicating the number of devices required.

Actual Results:
The "Devices Needed" field displays "NaN" (Not a Number) for pending orders, instead of a valid numeric value.

Test Intent:

Validate that the pending order list displays all device types when an order contains multiple devices (specifically, when device count is 2).

Steps to Recreate:

Log in to the application.
Navigate to the "Pending Orders" section.
Locate an order with a device count of 2.
Review the device type information displayed for that order.
Expected Results:
The pending order list should display both device types for orders with a device count of 2, ensuring users can identify all devices associated with the order.

Actual Results:
The pending order list displays only one device type when the device count for an order is 2. The second device type is omitted, preventing users from seeing all device types in the order.

Test Intent:

Validate that the pending order list displays the device type for every pending order.

Steps to Recreate:

Log in to the application.
Navigate to the "Pending Orders" section.
Review the list of pending orders.
Check if the device type is displayed for each order in the list.
Expected Results:
The pending order list should display the device type for all orders, enabling users to identify the type of device associated with each pending order.

Actual Results:
The pending order list does not display the device type for all orders. Some or all orders lack device type information, making it difficult for users to distinguish between device types.

Business Impact:
Users cannot identify device types for pending orders, which may cause confusion, hinder inventory management, and delay order processing.

Test Intent:

Validate that the pending order list displays the correct device count for each order.

Steps to Recreate:

Log in to the application.
Navigate to the "Pending Orders" section.
Review the list of pending orders.
Observe whether the device count is displayed for each order.
Expected Results:
The pending order list should display the device count for each order, allowing users to see how many devices are associated with each pending order.

Actual Results:
The pending order list does not display the device count. Users are unable to determine the number of devices associated with each pending order.

Business Impact:
Users cannot accurately track pending inventory, which may lead to operational inefficiencies, miscommunication, and delays in order processing.