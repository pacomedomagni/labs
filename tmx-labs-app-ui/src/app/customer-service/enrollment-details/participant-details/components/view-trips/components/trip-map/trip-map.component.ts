import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GoogleMap, MapAdvancedMarker, MapPolyline } from '@angular/google-maps';
import { EmptyStateComponent } from '@pgr-cla/core-ui-components';
import { forkJoin, Subject, take, tap } from 'rxjs';

import { INFO_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/information-dialog/information-dialog.component';
import { ProgressiveHQCoordinates } from 'src/app/shared/data/application/constants';
import { TripDetailGPS } from 'src/app/shared/data/participant/resources';
import { TripsService } from 'src/app/shared/services/api/trips/trips.service';
import { GoogleMapsService } from 'src/app/shared/services/google-maps-service/google-maps.service';

import { EventMarker } from './trip-map.models';
import { TripMapMarkerService } from './services/trip-map-marker.service';

interface TripMapDialogData {
    tripSeqID: number;
}

const MAP_BOUNDS_PADDING = 50;
const POLYLINE_OPTIONS: google.maps.PolylineOptions = {
    strokeColor: '#000000',
    strokeWeight: 3,
    strokeOpacity: 1.0,
};

@Component({
    selector: 'tmx-trip-map',
    imports: [EmptyStateComponent, GoogleMap, MapAdvancedMarker, AsyncPipe, MapPolyline],
    templateUrl: './trip-map.component.html',
    styleUrl: './trip-map.component.scss',
})
export class TripMapComponent implements OnInit, OnDestroy {
    readonly googleMapsService = inject(GoogleMapsService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly tripService = inject(TripsService);
    private readonly markerService = inject(TripMapMarkerService);
    private readonly injectedContent = inject<TripMapDialogData>(INFO_DIALOG_CONTENT, {
        optional: false,
    });

    readonly tripSeqID = this.injectedContent.tripSeqID;
    readonly dataLoaded = signal(false);
    readonly googleMapsService$ = this.googleMapsService.isApiLoaded$;
    readonly polylineOptions = POLYLINE_OPTIONS;

    // Map configuration
    readonly mapOptions: google.maps.MapOptions = {
        center: { lat: ProgressiveHQCoordinates.latitude, lng: ProgressiveHQCoordinates.longitude },
        mapId: 'TRIP_MAP',
    };

    data: TripDetailGPS[] = [];
    routePath: google.maps.LatLngLiteral[] = [];
    startLocation: google.maps.LatLngLiteral;
    endLocation: google.maps.LatLngLiteral;

    markers: EventMarker[] = [];
    startPin: google.maps.marker.PinElement;

    @ViewChild(GoogleMap) map!: GoogleMap;

    private mapInitialized$ = new Subject<void>();

    // Lifecycle hooks
    ngOnInit(): void {
        forkJoin({
            tripData: this.tripService.getTripDetailsGPS(this.tripSeqID).pipe(
                tap((data) => {
                    this.dataLoaded.set(true);
                    this.data = data.tripDetails;
                    this.markers = this.markerService.createEventMarkers(data.tripEvents);
                }),
            ),
            // We need to wait for the map to be ready before applying the data
            mapReady: this.mapInitialized$.pipe(take(1)),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.startPin = this.markerService.createStartMarkerPin();
                this.applyTripData();
                this.centerOnRoute();
            });
    }

    ngOnDestroy(): void {
        this.mapInitialized$.complete();
    }

    // Public methods
    onMapInitialized(): void {
        this.mapInitialized$.next();
    }

    // Private methods
    private centerOnRoute(): void {
        const bounds = new google.maps.LatLngBounds();
        this.routePath.forEach((point) => bounds.extend(point));
        
        // Include event markers in bounds calculation
        this.markers.forEach((marker) => bounds.extend(marker.position));

        // This allows the map to draw the points before fitting the bounds - similar to setTimeout
        requestAnimationFrame(() => {
            this.map.fitBounds(bounds, MAP_BOUNDS_PADDING);
        });
    }

    private applyTripData(): void {
        if (!this.data?.length) return;
        
        this.startLocation = { lat: this.data[0].latitude, lng: this.data[0].longitude };
        this.endLocation = {
            lat: this.data[this.data.length - 1].latitude,
            lng: this.data[this.data.length - 1].longitude,
        };
        this.routePath = this.data.map((point) => ({
            lat: point.latitude,
            lng: point.longitude,
        }));
    }
}
