import { Injectable } from '@angular/core';
import { EventMarker } from '../trip-map.models';
import { TripEvent } from 'src/app/shared/data/participant/resources';

@Injectable({
    providedIn: 'root',
})
export class TripMapMarkerService {
    private readonly EVENT_MARKER_CONFIG = {
        background: '#D41400',
        borderColor: '#000000',
        glyphColor: '#FFFFFF',
        glyph: '!',
    };

    private readonly START_MARKER_CONFIG = {
        background: '#00FF00',
        borderColor: '#00AA00',
        glyphColor: '#000000',
    };

    /**
     * Creates event markers from trip event data
     * @param events Array of trip events
     * @returns Array of EventMarker objects ready for map display
     */
    createEventMarkers(events: TripEvent[]): EventMarker[] {
        return events.map((event) => ({
            position: { lat: event.latitudeNbr, lng: event.longitudeNbr },
            content: new google.maps.marker.PinElement(this.EVENT_MARKER_CONFIG),
            options: {
                title: this.toTitleCase(event.description),
            },
        }));
    }

    /**
     * Creates a start location marker pin element
     * @returns PinElement configured for trip start location
     */
    createStartMarkerPin(): google.maps.marker.PinElement {
        return new google.maps.marker.PinElement(this.START_MARKER_CONFIG);
    }

    /**
     * Converts a string to title case
     * @param str String to convert
     * @returns Title case string
     */
    private toTitleCase(str: string): string {
        return str
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
}
