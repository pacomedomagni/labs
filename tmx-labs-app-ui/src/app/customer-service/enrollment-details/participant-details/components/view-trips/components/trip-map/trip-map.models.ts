export interface EventMarker {
    position: google.maps.LatLngLiteral;
    content?: Node | google.maps.marker.PinElement;
    options?: google.maps.marker.AdvancedMarkerElementOptions;
}