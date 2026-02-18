import { HelpTextData } from '../data/application/help-text/applications-help-text';
import { HelpTextType } from '../data/application/help-text/help-text.enum';

export enum HelpText {
    AudioChange = 'Set Audio',
    AudioManage = 'Manage Audio',
    DeviceMarkAbandoned = 'Mark Abandoned',
    DeviceMarkDefective = 'Mark Defective',
    DeviceReplace = 'Replace Device',
    DeviceSwap = 'Swap Devices',
    ExcludeTrips = 'Exclude Trips',
    TripMap = 'Trip Route Map',
    DeleteVehicle = 'Delete Vehicle',
    AddNewVehicle = 'Add Vehicle',
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    AddVehicle = 'Add Vehicle',
    EditCustomerDetails = 'Edit Customer Details',
    EditNickname = 'Edit Nickname',
    EditVehicle = 'Edit Vehicle',
    RemoteReset = 'Reset Device',
    OptOutReasonForPlugin = 'Opt Out',
    ViewTrips = 'View Trips',
    TripInsights = 'Trip Insights',
    WeekdayTripSummary = 'Weekday Trip Summary',
}

export const helpText: Map<string, HelpTextData> = new Map<string, HelpTextData>([
    [
        HelpText.AudioChange,
        {
            type: HelpTextType.Help,
            content: `<p>'Set Audio' allows you to turn on and off the audio tones that play on plug-in devices during the following events:</p>
        <ul>
            <li>Trip Start</li>
            <li>Hard Brake</li>
            <li>Extreme Brake</li>
            <li>Trip End</li>
        </ul>
        <p>By default, the device audio is set to 'On'.</p>
        `,
        },
    ],
    [
        HelpText.AudioManage,
        {
            type: HelpTextType.Help,
            content: `<p>'Manage Audio' allows you to turn on and off the audio tones that play on plug-in devices during the following events:</p>
        <ul>
            <li>Trip Start</li>
            <li>Hard Brake</li>
            <li>Extreme Brake</li>
            <li>Trip End</li>
        </ul>
        <p>By default, the device audio is set to 'On'.</p>
        `,
        },
    ],
    [
        HelpText.DeviceMarkAbandoned,
        {
            type: HelpTextType.Help,
            content: `'Mark Abandoned' allows you to indicate when a plug-in device is lost or unrecoverable.`,
        },
    ],
    [
        HelpText.DeviceMarkDefective,
        {
            type: HelpTextType.Help,
            content: `'Mark Defective' allows you to set the device's status to defective to ensure that the device will be removed from circulation and sent back to the manufacturer to be refurbished or destroyed.`,
        },
    ],
    [
        HelpText.DeviceReplace,
        {
            type: HelpTextType.Help,
            content: `'Replace Device' allows you to request a new plug-in device be assigned and shipped to the selected participant.`,
        },
    ],
    [
        HelpText.DeviceSwap,
        {
            type: HelpTextType.Help,
            content: `'Swap Devices' allows a user to switch device assignments between two vehicles on the same policy so that the trips collected on the devices are tied to the correct vehicles.`,
        },
    ],
    [
        HelpText.RemoteReset,
        {
            type: HelpTextType.Help,
            content: `'Reset Device' allows you to reset a plug-in device remotely so that the customer does not have to manually reset the device.`,
        },
    ],
    [
        HelpText.OptOutReasonForPlugin,
        {
            type: HelpTextType.Help,
            content: `'Opt Out' will remove the participant from the TMX Labs program. If a device is assigned, it should be returned.`,
        },
    ],
    [
        HelpText.DeleteVehicle,
        {
            type: HelpTextType.Help,
            content: `'Delete Vehicle' will remove the selected participant from this TMX Labs customer profile. You will no longer have access to view the trips associated with this participant.`,
        },
    ],
    [
        HelpText.EditCustomerDetails,
        {
            type: HelpTextType.Help,
            content: `'Edit Customer Details' allows you to update the mailing address used for shipping the customer's plug-in device. Make sure the address is accurate to ensure timely and successful delivery.`,
        },
    ],
    [
        HelpText.AddNewVehicle,
        {
            type: HelpTextType.Help,
            content: `'Add Vehicle' allows you to add a vehicle to a TMX Labs customer profile.`,
        },
    ],
    [
        HelpText.AddVehicle,
        {
            type: HelpTextType.Help,
            content: `'Add Vehicle' allows you to add a vehicle to a TMX Labs customer profile.`,
        },
    ],
    [
        HelpText.EditNickname,
        {
            type: HelpTextType.Help,
            content: `'Edit Nickname' allows you to customize the nickname displayed at the top of each participant's collapsible section to help you more easily identify each participant at a glance.<br/><br/>By default, the nickname is set to the year, make, and model of your vehicle.`,
        },
    ],
    [
        HelpText.EditVehicle,
        {
            type: HelpTextType.Help,
            content: `'Edit Vehicle' lets you update the year, make, and model of the vehicle associated with this Labs participant.<br/><br/>Use this option to ensure the vehicle details are accurate and up-to-date.`,
        },
    ],
    [
        HelpText.ViewTrips,
        {
            type: HelpTextType.Help,
            content: `'View Trips' displays all recorded trip data that has not been excluded. If a date range has been marked as excluded, any trips within that range will not appear in the table.`,
        },
    ],
    [
        HelpText.TripInsights,
        {
            type: HelpTextType.Help,
            content: `<div class="flex flex-col gap-xxs">
                <span>
                    'Trip Insights' provides a detailed view of a single trip, including speed trends and risk levels throughout a journey
                </span>
                <ul class="list-disc">
                    <li>The graph shows speed over time for the selected trip.</li>
                    <li>Hover over the black line to see a tooltip with the exact speed, timestamp, and associated risk level at that point.</li>
                    <li>The risk bar below the graph indicated periods of low, medium, or high risk based on time of day.</li>
                    </ul>
            </div>`,
        },
    ],
    [
        HelpText.WeekdayTripSummary,
        {
            type: HelpTextType.Help,
            content: `'Weekday Trip Summary' provides an overview of a participant's aggregated trip data, organized by the day of the week the trips occurred.`,
        },
    ],
    [
        HelpText.ExcludeTrips,
        {
            type: HelpTextType.Help,
            content: `&#39;Exclude Trips&#39; excludes trip data for a given date range so that the data is not used in trip results (i.e. View Trips, Weekday Trip Summary, etc.).`,
        },
    ],
    [
        HelpText.TripMap,
        {
            type: HelpTextType.Help,
            content: `<div class="flex flex-col gap-xxs">
                <span>
                    'Trip Route Map'  allows you to confirm the route traveled for a given trip.
                </span>
                <ul class="list-disc">
                    <li>The map shows the starting point (green marker) and ending point (red marker) of your route.</li>
                    <li>Red markers with an exclamation point highlight hard braking or acceleration events. Hover to see event details.</li>
                    <li>You can switch between Map and Satellite view for more detail.</li>
                    </ul>
            </div>`,
        },
    ],
]);
