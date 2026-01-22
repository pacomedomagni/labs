import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, DestroyRef, WritableSignal, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TripsService } from 'src/app/shared/services/api/trips/trips.service';
import { TripDetail } from 'src/app/shared/data/participant/resources';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmptyStateComponent } from "@pgr-cla/core-ui-components";
import { TABLE_DIALOG_CONTENT, TABLE_DIALOG_SHOW_PAGINATOR } from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';

Chart.register(...registerables);

type RiskLevel = 'low' | 'medium' | 'high';

interface TripInsightsData {
    tripSeqId: number;
    speedDistanceUnit: string;
    tripStartDateTime: string;
    tripEndDateTime: string;
}

@Component({
    selector: 'tmx-trip-insights',
    standalone: true,
    imports: [CommonModule, EmptyStateComponent],
    templateUrl: './trip-insights.component.html',
    styleUrls: ['./trip-insights.component.scss'],
})
export class TripInsightsComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('tripSpeedChart', { static: false }) speedChartCanvas!: ElementRef<HTMLCanvasElement>;

    private readonly tripsService = inject(TripsService);
    private readonly injectedData = inject<TripInsightsData>(TABLE_DIALOG_CONTENT, { optional: true });
    private readonly destroyRef = inject(DestroyRef);
    private readonly showPaginator = inject<WritableSignal<boolean>>(TABLE_DIALOG_SHOW_PAGINATOR, { optional: true });
    private readonly cdr = inject(ChangeDetectorRef);

    // State
    tripDetails: TripDetail[] = [];
    isLoading = true;
    error: string | null = null;

    private speedChart: Chart | null = null;
    private viewInitialized = false;

    constructor() {
        // Hide paginator in the dialog since this component doesn't need pagination
        if (this.showPaginator) {
            this.showPaginator.set(false);
        }
    }

    ngOnInit(): void {
        if (!this.injectedData) {
            this.error = 'No trip data provided';
            this.isLoading = false;
            return;
        }
        this.loadTripDetails();
    }

    ngAfterViewInit(): void {
        // Mark view as initialized
        this.viewInitialized = true;
        // Initialize chart if data is already loaded
        if (this.tripDetails && this.tripDetails.length > 0) {
            this.initCharts();
        }
    }

    speedDistanceUnit(): string {
        return this.injectedData?.speedDistanceUnit || 'mph';
    }

    private loadTripDetails(): void {
        if (!this.injectedData) {
            return;
        }

        this.isLoading = true;
        this.error = null;

        this.tripsService
            .getTripDetails(this.injectedData.tripSeqId, this.injectedData.speedDistanceUnit)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (data) => {
                    if (!data || data.length === 0) {
                        this.error = 'No trip details available for this trip.';
                    } else {
                        this.tripDetails = data;
                        // Trigger change detection
                        this.cdr.markForCheck();
                        this.cdr.detectChanges();
                        // Initialize chart if view is already ready, with a small delay to ensure DOM is updated
                        if (this.viewInitialized) {
                            setTimeout(() => {
                                this.initCharts();
                            }, 100);
                        }
                    }
                    this.isLoading = false;
                },
                error: (err) => {
                    this.error = 'Failed to load trip details. Please try again.';
                    this.isLoading = false;
                    console.error('Error loading trip details:', err);
                },
            });
    }

    private initCharts(): void {
        if (!this.tripDetails || this.tripDetails.length === 0) {
            this.error = 'No trip details available.';
            return;
        }

        this.createSpeedChart(this.tripDetails);
    }

    private createSpeedChart(tripDetails: TripDetail[]): void {
        if (!this.speedChartCanvas) {
            return;
        }

        // Destroy existing chart if it exists
        if (this.speedChart) {
            this.speedChart.destroy();
        }

        const timeData = this.convertElapsedTimeToTimeOfDay(tripDetails);
        const speedData: number[] = tripDetails.map((td) => td.speed);
        const riskLevels: RiskLevel[] = tripDetails.map((td) => this.getRiskLevel(new Date(this.injectedData!.tripStartDateTime).getTime() + td.elapsedTimeMilliseconds));

        const lowRiskData: (number | null)[] = speedData.map((speed, i) => riskLevels[i] === 'low' ? speed : null);
        const mediumRiskData: (number | null)[] = speedData.map((speed, i) => riskLevels[i] === 'medium' ? speed : null);
        const highRiskData: (number | null)[] = speedData.map((speed, i) => riskLevels[i] === 'high' ? speed : null);

        const config: ChartConfiguration = {
            type: 'line',
            data: {
                labels: timeData,
                datasets: [
                    {
                        label: 'Low Risk',
                        data: lowRiskData,
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1,
                        pointRadius: 0.75,
                        pointBackgroundColor: '#4caf50',
                        pointBorderColor: '#4caf50',
                        pointBorderWidth: 1,
                        segment: {
                            borderColor: (ctx: { p1DataIndex: number }) => this.getRiskColor(riskLevels[ctx.p1DataIndex]),
                        },
                    },
                    {
                        label: 'Medium Risk',
                        data: mediumRiskData,
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1,
                        pointRadius: 0.75,
                        pointBackgroundColor: '#ff9800',
                        pointBorderColor: '#ff9800',
                        pointBorderWidth: 1,
                        segment: {
                            borderColor: (ctx: { p1DataIndex: number }) => this.getRiskColor(riskLevels[ctx.p1DataIndex]),
                        },
                    },
                    {
                        label: 'High Risk',
                        data: highRiskData,
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1,
                        pointRadius: 0.75,
                        pointBackgroundColor: '#f44336',
                        pointBorderColor: '#f44336',
                        pointBorderWidth: 1,
                        segment: {
                            borderColor: (ctx: { p1DataIndex: number }) => this.getRiskColor(riskLevels[ctx.p1DataIndex]),
                        },
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 10,
                        titleFont: { size: 12 },
                        bodyFont: { size: 11 },
                        callbacks: {
                            title: (context: unknown) => {
                                const ctx = context as { dataIndex: number }[];
                                return timeData[ctx[0].dataIndex];
                            },
                            label: (context: unknown) => {
                                const ctx = context as { parsed: { y: number } };
                                return `Speed: ${ctx.parsed.y} ${this.speedDistanceUnit()}/hr`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time of Day',
                        },
                        ticks: {
                            maxTicksLimit: 4,
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: `Speed (${this.speedDistanceUnit()}/hr)`,
                        },
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 10,
                        },
                    },
                },
            },
        };

        this.speedChart = new Chart(this.speedChartCanvas.nativeElement, config);
    }

    private convertElapsedTimeToTimeOfDay(tripDetails: TripDetail[]): string[] {
        if (!this.injectedData?.tripStartDateTime) {
            return tripDetails.map((td) => (td.elapsedTimeMilliseconds / 1000 / 60).toFixed(2));
        }

        const tripStartDate = new Date(this.injectedData.tripStartDateTime);
        const startTimeMs = tripStartDate.getTime();
        
        return tripDetails.map((td) => {
            const elapsedMs = td.elapsedTimeMilliseconds;
            const timeOfDayMs = startTimeMs + elapsedMs;
            const timeOfDay = new Date(timeOfDayMs);
            return timeOfDay.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });
        });
    }

    private getRiskLevel(timestampMs: number): RiskLevel {
        const date = new Date(timestampMs);
        const hour = date.getHours();
        const day = date.getUTCDay();
        const isWeekend = day === 0 || day === 6;

        // High Risk: All days 12 AM - 4 AM (0 - 3)
        if (hour >= 0 && hour < 4) {
            return 'high';
        }

        if (isWeekend) {
            // Weekend Low Risk: 6 AM - 9 PM (6 - 20)
            if (hour >= 6 && hour < 21) {
                return 'low';
            }
            // Weekend Medium Risk: 4 AM - 6 AM, 9 PM - 12 AM (4-6, 21-23)
            if ((hour >= 4 && hour < 6) || (hour >= 21 && hour < 24)) {
                return 'medium';
            }
            // Weekend High Risk: anything else (including midnight)
            return 'high';
        } else {
            // Weekday Low Risk: 9 AM - 3 PM, 6 PM - 9 PM (9-15, 18-21)
            if ((hour >= 9 && hour < 15) || (hour >= 18 && hour < 21)) {
                return 'low';
            }
            // Weekday Medium Risk: 4 AM - 9 AM, 3 PM - 6 PM, 9 PM - 12 AM (4-9, 15-18, 21-23)
            if ((hour >= 4 && hour < 9) || (hour >= 15 && hour < 18) || (hour >= 21 && hour < 24)) {
                return 'medium';
            }
            // Weekday High Risk: anything else
            return 'high';
        }
    }

    private getRiskColor(riskLevel: RiskLevel): string {
        switch (riskLevel) {
            case 'low':
                return '#4caf50';
            case 'medium':
                return '#ff9800';
            case 'high':
                return '#f44336';
            default:
                return '#000000';
        }
    }

    ngOnDestroy(): void {
        if (this.speedChart) {
            this.speedChart.destroy();
        }
    }
}
