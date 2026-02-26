As a TMX Labs user,
I want to be able to:

Review a list of completed orders for Labs participants.
Filter the list by user and processed date.
View the count of Completed Orders based on the applied filters.
Download the filtered Completed Orders results.
Print the filtered Completed Orders results.
Open the Order Details modal by selecting an order in the list.
So that I can effectively manage and review completed orders for Labs participants.

Background:  The Order Fulfillment page provides TMX Labs Admins a centralized workspace to review, locate, and process device orders for Labs Snapshot participants, including order search capabilities and access to both pending and completed order data.

Device order fulfillment functionality is restricted to users with the TMX Labs Admin role (UBILABSADM-01).

This card is one of a suite of cards detailing the Order Fulfillment page display and functionalities:
Product Backlog Item 6459610: TMX Labs | Order Fulfillment | Order Fulfillment Page Structure and Search
Product Backlog Item 6459612: TMX Labs | Order Fulfillment | Order Fulfillment Page - Pending Orders Tab
Product Backlog Item 6478013: TMX Labs | Order Fulfillment | Order Fulfillment Page - Completed Orders Tab
Product Backlog Item 6478014: TMX Labs | Order Fulfillment | Order Fulfillment Page - Order Details Modal
The scope of this PBI is to implement the Completed Orders tab functions, including the Filter Order By panel, and the sortable Completed Order List table with full filter, download, print, and pagination interactions.


NOTE: Order Fulfillment page layout requirements are found in Product Backlog Item 6459610: TMX Labs | Order Fulfillment | Order Fulfillment Page Structure and Search


Scenario: Display COMPLETED ORDERS Tab Elements
Given a TMX Labs Admin is viewing the COMPLETED ORDERS tab on the Order Fulfillment page
Then the following Completed Orders elements are present:

Filter Order By Section
The Filter Orders By panel appears beneath the “Orders / Search” section on the left side of the page.
This panel includes filter controls the user can use to refine the Completed Orders table results.
All filters are set to their default values upon entering the tab.
Processed By Filter
Control type: Multi‑select picklist
Contains: All users who have fulfilled orders
List order: Alphabetical by Last Name, First Name
Default state:
No users selected
When unselected, all Completed Orders display
Behavior:
Selecting one or more users filters the list to the orders processed by those users.
Processed Date Filter
Control type: Two date pickers (Start Date, End Date)
Default state:
Start Date = Today
End Date = Today
Behavior:
User may select a date range to filter orders by processed date.
Validation ensures End Date ≥ Start Date.
CLEAR Button
Displayed: Bottom‑right corner of Filter Orders By section
Behavior:
CLEAR button is disabled by default and when all filters are in their default settings.
CLEAR button is enabled once any of the filters are changed from their defaults setting.
Resets all filters to their default values:
No Processed By users selected
Processed Date = fields reset to Today

COMPLETED ORDERS Order List Section
The Completed Orders Order List is positioned on the right side of the page, beneath the Completed Orders sub‑tab header and directly to the right of the Filter Orders By panel (see provided screenshot).

Subheader

A subheader is displayed directly above the Completed Order List table.

Subheader Content
Completed Orders Count
Displayed on the left side of the subheader.
Shows the total number of Completed Orders returned by the current filter selection.
When no filters are selected:
The count matches the “Completed Today” tile at the top of the page.
When filters are selected:
The count updates dynamically to reflect the filtered list.
Subheader Buttons

Displayed on the right side of the subheader:

DOWNLOAD Button
Displays to the left of the PRINT button.
When selected:
A CSV file is generated containing the dataset of the currently filtered Completed Orders list.
The default filename format is:
Orders_<YYYYMMDD of Processed Date>_<UserID>.csv
If no Processed By filter is applied, UserID = ALL.
Filename examples:
20260201_BKOSAR1.csv
20260201_ALL.csv

PRINT Button
Displays to the right of the DOWNLOAD button.
When selected:
A print dialog opens.
The document displaying in the print dialog displays: 
Header: Processed Orders
Subheader includes:
Processed Date Range selected in the Filter Orders By section
Selected Users selected in the Filter Orders By section
Completed Orders Count
Order List is formatted using the Completed Orders table structure (see below) for clean, easy-to-read printing.
Selecting Print prints the file to the chosen printer.
Selecting Cancel returns the user to the Order Fulfillment page.
Always prints the dataset of the currently filtered Completed Orders list.


Completed Orders Table

The Completed Orders Order List table displays the completed orders matching the current filter criteria.
Default State (No Filters Applied)
Table displays all Completed Orders for today (based on default date filter values).
Completed Orders count matches the Completed Today KPI tile.

Sorting
Orders are sorted by Processed Date, with:
Most recently processed orders at the top
Oldest orders at the bottom
Users have the ability to change the sorting of the Order List by selecting any of the following column headers:
Order #
Processed Date
Shipped Date
Processed By
State
Scrolling
If visible table rows exceed the vertical space:
A vertical scrollbar appears on the right.

Table Structure and Data Fields
Each row represents one completed order.

Displayed Columns
Order #
Displays as a blue hyperlink.
Selecting the link opens the  Order Details modal. 
Modal functionality is out of scope for this PBI, but is covered in: Product Backlog Item 6478014: TMX Labs | Order Fulfillment | Order Fulfillment Page - Order Details Modal
Processed Date: The date the order was completed. (UbiLabsMyScore.DeviceOrder.ProcessedDateTime)
Shipped Date: The date the order was shipped. (UbiLabsMyScore.DeviceOrder.ShipDateTime)
Processed By: The name of the user who fulfilled the order. 
State: The insured’s 2 character state abbreviation.
Device Count: Count of devices associated with the order.
Devices
List of all devices assigned to the order
Displays the Device Serial Number of the assigned devices
One order row may display multiple Device Serial Numbers.

Dynamic Updates Based on Filters
As filters are applied in the Filter Orders By panel:
The Order List updates immediately.
The Completed Orders count updates.
The DOWNLOAD and PRINT outputs include only filtered results.
If filters are cleared:
Table returns to default state.
Pagination Controls
Located at the bottom right of the Order List section, below the table.
Items Per Page Dropdown
Allows selection of the number of orders displayed per page. 
Behavior:

Changing the value updates the table to display the selected number of rows.
When a value greater than 10 is chosen, a vertical scrollbar appears within the table to allow scrolling through the rows.
Navigating pages updates the table accordingly.
Pagination Range Display
Example: “1 – 10 of 21,701”
Shows the current visible item range and total count.
Navigation Arrows
The following navigation buttons are displayed:

First Page ( |« )
Previous Page ( ‹ )
Next Page ( › )
Last Page ( »| )
Behavior:

Buttons are disabled when navigation in that direction is not possible (e.g., “First” and “Previous” disabled on page 1).

Scenario: View Default Completed Orders Tab
Given a TMX Labs Admin is viewing the COMPLETED ORDERS tab
When the page loads
Then all filters in the Filter Orders By panel are set to their default state
And the Completed Orders table displays all orders for today

And the CLEAR button is disabled
And the Completed Orders Count matches the Completed Today KPI tile.

Processed By Filtering

Scenario: Filter Orders Processed By One User
Given the user is viewing the Completed Orders tab
When the user selects one user in the Processed By multi‑select picklist
Then the Completed Orders table updates to display only orders processed by that user
And the Completed Orders Count updates to reflect the filtered list

And the CLEAR button is enabled
And the DOWNLOAD and PRINT outputs include only those filtered orders.


Scenario: Filter Orders Processed By Multiple Users
Given the user is viewing the Completed Orders tab
When the user selects multiple users in the Processed By picklist
Then the table updates to show orders processed by any of the selected users

And the CLEAR button is enabled
And the Completed Orders Count updates accordingly.


Scenario: Clear All Users From The Processed By Filter
Given the user has selected one or more users in the Processed By picklist
When the user deselects all users
Then the table returns to showing all orders for the selected date range
And the Completed Orders Count updates to reflect the unfiltered results.

Processed Date Filtering​
Scenario: Change the start and end dates
Given the user is viewing the Completed Orders tab
When the admin selects a new Start Date and End Date
Then the table updates to show orders completed within the date range
And the Completed Orders Count updates

And the CLEAR button is enabled
And DOWNLOAD and PRINT reflect the filtered dataset.

Scenario: Enter an invalid date range
Given the user is setting a date range
When the user sets an End Date earlier than the Start Date
Then validation prevents saving the End Date
And the End Date must be adjusted to be on or after the Start Date.

Clearing All Filters
Clear all filters
Given the user has set Processed By and/or Processed Date filters
When the user selects the CLEAR button
Then all filters reset to default values
And Processed By = no users selected
And Processed Date = today
And the Completed Orders table returns to the default dataset.

Downloading Completed Orders
Scenario: Downloading With No Filters
Given the user is viewing the default Completed Orders list
When the user selects DOWNLOAD
Then a CSV file containing today’s Completed Orders is generated
And the filename follows: <YYYYMMDD Processed Date>__ALL.csv

Orders_<YYYYMMDD of Processed Date>_<UserID>.csv
If no Processed By filter is applied, UserID = ALL.
Filename examples:
20260201_BKOSAR1.csv
20260201_ALL.csv

Scenario: Downloading With Filters Applied

Given the user has applied Processed By and/or Processed Date filters
When the user selects DOWNLOAD
Then a CSV is generated containing only the filtered results
And the filename follows: <YYYYMMDD Processed Date>__<UserID>.csv

Printing Completed Orders
Scenario: Print the filtered or unfiltered order list
Given the user is viewing the Completed Orders table
When the user selects PRINT
Then a print dialog opens
And the document displays:

Header: Processed Orders
Subheader: 
Processed Date Range selected in the Filter Orders By section
Selected Users selected in the Filter Orders By section
Completed Orders Count
A formatted table of the order data
And selecting Print sends the file to the chosen printer
And selecting Cancel returns the admin to the Order Fulfillment page.

Viewing Order Details
Scenario: Device Order modal
Note: This scenario is not testable until completion of the following: 
Product Backlog Item 6478014: TMX Labs | Order Fulfillment | Order Fulfillment Page - Device Order Modal - SECTION 1 — Assign Devices
Product Backlog Item 6982228: TMX Labs | Order Fulfillment | Order Fulfillment Page - Device Order Modal - SECTION 2 — Print Shipping Label
Given the user is viewing the Completed Orders table
When the user selects an Order # hyperlink
Then the Device Order modal opens
And the modal opens to the Shipping Label section 

Paging Through the Order List
Scenario: Change Items Per Page
Given the user is viewing the table
And the “Items per page” is set to a value (10, 25, 50, 100)
When the user changes “Items per page” to a different value
Then the table updates to show that many rows
And the vertical scrollbar will display if the newly selected number of rows exceeds 10

Scenario: Navigate to another page
Given multiple pages of data exist
When the user selects Next, Previous, First, or Last page
Then the table updates to show the corresponding page
And the navigation buttons become disabled when movement is not possible.

Dynamic Filter Behavior
Scenario: Table Updates As Filters Change
Given the user is adjusting any filter
When the user changes a Processed By or Processed Date value
Then the table updates immediately
And the Completed Orders Count updates
And DOWNLOAD and PRINT will include only the currently filtered list.


A bug unreleated
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