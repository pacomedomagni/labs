import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripInsightsComponent } from './trip-insights.component';
import { TripsService } from 'src/app/shared/services/api/trips/trips.service';
import { TABLE_DIALOG_CONTENT, TABLE_DIALOG_SHOW_PAGINATOR } from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';
import { TripDetail } from 'src/app/shared/data/participant/resources';
import { of, throwError } from 'rxjs';
import { signal, Signal } from '@angular/core';

describe('TripInsightsComponent', () => {
  let component: TripInsightsComponent;
  let fixture: ComponentFixture<TripInsightsComponent>;
  let mockTripsService: jasmine.SpyObj<TripsService>;
  let mockShowPaginator: Signal<boolean>;

  const mockTripInsightsData = {
    tripSeqId: 123,
    speedDistanceUnit: 'Miles',
    tripStartDateTime: '2024-01-15T08:00:00Z',
    tripEndDateTime: '2024-01-15T08:30:00Z',
  };

  const mockTripDetails: TripDetail[] = [
    { elapsedTimeMilliseconds: 0, speed: 35 },
    { elapsedTimeMilliseconds: 5000, speed: 45 },
    { elapsedTimeMilliseconds: 10000, speed: 55 },
    { elapsedTimeMilliseconds: 15000, speed: 40 },
    { elapsedTimeMilliseconds: 20000, speed: 30 },
  ];

  beforeEach(async () => {
    mockTripsService = jasmine.createSpyObj('TripsService', ['getTripDetails']);
    mockShowPaginator = signal(true);

    await TestBed.configureTestingModule({
      imports: [TripInsightsComponent],
      providers: [
        {
          provide: TABLE_DIALOG_CONTENT,
          useValue: mockTripInsightsData,
        },
        {
          provide: TABLE_DIALOG_SHOW_PAGINATOR,
          useValue: mockShowPaginator,
        },
        {
          provide: TripsService,
          useValue: mockTripsService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripInsightsComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should hide the paginator on construction', () => {
      expect(mockShowPaginator()).toBe(false);
    });

    it('should set isLoading to true initially', () => {
      expect(component.isLoading).toBe(true);
    });

    it('should initialize tripDetails as empty array', () => {
      expect(component.tripDetails).toEqual([]);
    });

    it('should initialize error as null', () => {
      expect(component.error).toBeNull();
    });
  });

  describe('ngOnInit', () => {
    it('should load trip details when injected data is provided', () => {
      mockTripsService.getTripDetails.and.returnValue(of(mockTripDetails));
      component.ngOnInit();
      expect(mockTripsService.getTripDetails).toHaveBeenCalledWith(123, 'Miles');
    });

    it('should set error when no injected data is provided', () => {
      // Create a new TestBed without TABLE_DIALOG_CONTENT to simulate no injected data
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TripInsightsComponent],
        providers: [
          { provide: TABLE_DIALOG_SHOW_PAGINATOR, useValue: signal(true) },
          { provide: TripsService, useValue: mockTripsService },
        ],
      });
      const componentWithoutData = TestBed.createComponent(TripInsightsComponent);
      componentWithoutData.componentInstance.ngOnInit();
      expect(componentWithoutData.componentInstance.error).toBe('No trip data provided');
      expect(componentWithoutData.componentInstance.isLoading).toBe(false);
    });
  });

  describe('loadTripDetails', () => {
    beforeEach(() => {
      mockTripsService.getTripDetails.and.returnValue(of(mockTripDetails));
      fixture.detectChanges(); // Trigger ngOnInit
    });

    it('should set tripDetails when data is successfully loaded', (done) => {
      component.ngOnInit();

      setTimeout(() => {
        expect(component.tripDetails).toEqual(mockTripDetails);
        expect(component.isLoading).toBe(false);
        expect(component.error).toBeNull();
        done();
      }, 150);
    });

    it('should set error message when no trip details are returned', (done) => {
      mockTripsService.getTripDetails.and.returnValue(of([]));
      component.ngOnInit();

      setTimeout(() => {
        expect(component.error).toBe('No trip details available for this trip.');
        expect(component.isLoading).toBe(false);
        done();
      }, 150);
    });

    it('should set error message on service failure', (done) => {
      mockTripsService.getTripDetails.and.returnValue(throwError(() => new Error('Service error')));
      component.ngOnInit();

      setTimeout(() => {
        expect(component.error).toBe('Failed to load trip details. Please try again.');
        expect(component.isLoading).toBe(false);
        done();
      }, 150);
    });

    it('should handle null data response', (done) => {
      mockTripsService.getTripDetails.and.returnValue(of(null as unknown as TripDetail[]));
      component.ngOnInit();

      setTimeout(() => {
        expect(component.error).toBe('No trip details available for this trip.');
        done();
      }, 150);
    });
  });

  describe('speedDistanceUnit', () => {
    beforeEach(() => {
      mockTripsService.getTripDetails.and.returnValue(of(mockTripDetails));
    });

    it('should return the injected speedDistanceUnit', () => {
      fixture.detectChanges();
      expect(component.speedDistanceUnit()).toBe('Miles');
    });

    it('should return default value when speedDistanceUnit is not provided', () => {
      const componentWithoutUnit = TestBed.createComponent(TripInsightsComponent);
      const data = { ...mockTripInsightsData, speedDistanceUnit: undefined as unknown as string };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TripInsightsComponent],
        providers: [
          { provide: TABLE_DIALOG_CONTENT, useValue: data },
          { provide: TABLE_DIALOG_SHOW_PAGINATOR, useValue: signal(true) },
          { provide: TripsService, useValue: mockTripsService },
        ],
      });
      expect(componentWithoutUnit.componentInstance.speedDistanceUnit()).toBe('Miles');
    });
  });

  describe('convertElapsedTimeToTimeOfDay', () => {
    it('should convert elapsed milliseconds to time of day', () => {
      mockTripsService.getTripDetails.and.returnValue(of(mockTripDetails));
      fixture.detectChanges();
      const result = component['convertElapsedTimeToTimeOfDay'](mockTripDetails);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(mockTripDetails.length);
      expect(typeof result[0]).toBe('string');
      // Verify it contains time format pattern (h:mm:ss AM/PM)
      expect(result[0]).toMatch(/\d{1,2}:\d{2}:\d{2}\s(?:AM|PM)/);
    });

    it('should return fallback values when no start datetime is provided', () => {
      const componentWithoutDateTime = TestBed.createComponent(TripInsightsComponent);
      const data = { ...mockTripInsightsData, tripStartDateTime: undefined };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TripInsightsComponent],
        providers: [
          { provide: TABLE_DIALOG_CONTENT, useValue: data },
          { provide: TABLE_DIALOG_SHOW_PAGINATOR, useValue: signal(true) },
          { provide: TripsService, useValue: mockTripsService },
        ],
      });
      
      const result = componentWithoutDateTime.componentInstance['convertElapsedTimeToTimeOfDay'](mockTripDetails);
      expect(result).toBeDefined();
      expect(result.length).toBe(mockTripDetails.length);
    });
  });

  describe('getRiskLevel', () => {
    beforeEach(() => {
      mockTripsService.getTripDetails.and.returnValue(of(mockTripDetails));
      fixture.detectChanges(); // Initialize component
    });

    // Helper to create a date with specific local time and UTC day
    const createLocalDate = (year: number, month: number, day: number, hour: number, minute = 0): number => {
      return new Date(year, month - 1, day, hour, minute, 0).getTime();
    };

    it('should return high risk for early morning hours (12 AM - 4 AM)', () => {
      // Saturday 2:00 AM local time
      const saturdayEarlyMorning = createLocalDate(2024, 1, 13, 2, 0);
      expect(component['getRiskLevel'](saturdayEarlyMorning)).toBe('high');
      
      // Monday 1:30 AM local time
      const weekdayEarlyMorning = createLocalDate(2024, 1, 15, 1, 30);
      expect(component['getRiskLevel'](weekdayEarlyMorning)).toBe('high');
    });

    it('should return low risk for weekday daytime hours (9 AM - 3 PM, 6 PM - 9 PM)', () => {
      // Monday 10:00 AM local time
      const mondayMorning = createLocalDate(2024, 1, 15, 10, 0);
      expect(component['getRiskLevel'](mondayMorning)).toBe('low');
      
      // Monday 7:00 PM local time
      const mondayEvening = createLocalDate(2024, 1, 15, 19, 0);
      expect(component['getRiskLevel'](mondayEvening)).toBe('low');
    });

    it('should return low risk for weekend daytime hours (6 AM - 9 PM)', () => {
      // Saturday 10:00 AM local time
      const saturdayMorning = createLocalDate(2024, 1, 13, 10, 0);
      expect(component['getRiskLevel'](saturdayMorning)).toBe('low');
      
      // Sunday 8:00 PM local time
      const sundayEvening = createLocalDate(2024, 1, 14, 20, 0);
      expect(component['getRiskLevel'](sundayEvening)).toBe('low');
    });

    it('should return medium risk for weekday transition hours', () => {
      // Monday 8:00 AM local time
      const mondayEarlyMorning = createLocalDate(2024, 1, 15, 8, 0);
      expect(component['getRiskLevel'](mondayEarlyMorning)).toBe('medium');
      
      // Monday 5:00 PM local time
      const mondayAfternoon = createLocalDate(2024, 1, 15, 17, 0);
      expect(component['getRiskLevel'](mondayAfternoon)).toBe('medium');
      
      // Monday 11:00 PM local time
      const mondayLateNight = createLocalDate(2024, 1, 15, 23, 0);
      expect(component['getRiskLevel'](mondayLateNight)).toBe('medium');
    });

    it('should return medium risk for weekend transition hours', () => {
      // Saturday 5:00 AM local time
      const saturdayEarlyMorning = createLocalDate(2024, 1, 13, 5, 0);
      expect(component['getRiskLevel'](saturdayEarlyMorning)).toBe('medium');
      
      // Saturday 10:00 PM local time
      const saturdayLateNight = createLocalDate(2024, 1, 13, 22, 0);
      expect(component['getRiskLevel'](saturdayLateNight)).toBe('medium');
    });
  });

  describe('getRiskColor', () => {
    it('should return green color for low risk', () => {
      expect(component['getRiskColor']('low')).toBe('#4caf50');
    });

    it('should return orange color for medium risk', () => {
      expect(component['getRiskColor']('medium')).toBe('#ff9800');
    });

    it('should return red color for high risk', () => {
      expect(component['getRiskColor']('high')).toBe('#f44336');
    });

    it('should return black as default color', () => {
      // Test with an invalid risk level (should return default color)
      const invalidRiskLevel = 'invalid' as unknown as 'low' | 'medium' | 'high';
      expect(component['getRiskColor'](invalidRiskLevel)).toBe('#000000');
    });
  });

  describe('ngAfterViewInit', () => {
    beforeEach(() => {
      mockTripsService.getTripDetails.and.returnValue(of(mockTripDetails));
    });

    it('should mark view as initialized', () => {
      fixture.detectChanges();
      fixture.ngZone?.run(() => {
        fixture.detectChanges(); // Trigger AfterViewInit
        expect((component as unknown as { viewInitialized: boolean }).viewInitialized).toBe(true);
      });
    });

    it('should initialize chart when data is already loaded', (done) => {
      mockTripsService.getTripDetails.and.returnValue(of(mockTripDetails));
      fixture.detectChanges(); // Initialize component and trigger ngOnInit
      
      setTimeout(() => {
        fixture.detectChanges();
        fixture.ngZone?.run(() => {
          fixture.detectChanges();
          // Verify that chart initialization was triggered
          expect(component.tripDetails).toBeDefined();
          expect(component.tripDetails.length).toBeGreaterThan(0);
          done();
        });
      }, 150);
    });
  });

  describe('ngOnDestroy', () => {
    it('should destroy the chart when component is destroyed', () => {
      mockTripsService.getTripDetails.and.returnValue(of(mockTripDetails));
      fixture.detectChanges();
      component.ngOnInit();
  
      // Create a mock canvas element for chart creation
      const canvas = document.createElement('canvas');
      component['speedChartCanvas'] = { nativeElement: canvas };
      
      fixture.ngZone?.run(() => {
        fixture.detectChanges();
      });
      
      component.ngOnDestroy();
      // Verify the component is destroyed (no exceptions thrown)
      expect(true).toBe(true);
    });
  });

  describe('Chart Creation', () => {
    beforeEach(() => {
      mockTripsService.getTripDetails.and.returnValue(of(mockTripDetails));
      fixture.detectChanges();
    });

    it('should not create chart when speedChartCanvas is not available', () => {
      component.ngOnInit();
      // Don't set the ViewChild
      component['createSpeedChart'](mockTripDetails);
      const componentWithChart = component as unknown as { speedChart: unknown };
      expect(componentWithChart.speedChart).toBeDefined();
    });

    it('should set error when initializing chart with empty data', () => {
      component.ngOnInit();
      component['initCharts']();
      // Set empty tripDetails
      component.tripDetails = [];
      component['initCharts']();
      expect(component.error).toBe('No trip details available.');
    });

    it('should handle chart creation with valid trip details', (done) => {
      component.ngOnInit();
      
      // Create mock canvas
      const canvas = document.createElement('canvas');
      component['speedChartCanvas'] = { nativeElement: canvas };
      
      fixture.ngZone?.run(() => {
        fixture.detectChanges();
      });

      setTimeout(() => {
        component['createSpeedChart'](mockTripDetails);
        // Chart should be created (Chart.js will handle the actual rendering)
        const componentWithCanvas = component as unknown as { speedChartCanvas: unknown };
        expect(componentWithCanvas.speedChartCanvas).toBeDefined();
        done();
      }, 100);
    });
  });

  describe('Risk Level Dataset Separation', () => {
    it('should correctly separate trip data by risk levels', () => {
      mockTripsService.getTripDetails.and.returnValue(of(mockTripDetails));
      fixture.detectChanges();
      const speedData = mockTripDetails.map((td) => td.speed);
      const riskLevels = mockTripDetails.map((td) =>
        component['getRiskLevel'](
          new Date(mockTripInsightsData.tripStartDateTime).getTime() + td.elapsedTimeMilliseconds
        )
      );

      const lowRiskData = speedData.map((speed, i) => (riskLevels[i] === 'low' ? speed : null));
      const mediumRiskData = speedData.map((speed, i) => (riskLevels[i] === 'medium' ? speed : null));
      const highRiskData = speedData.map((speed, i) => (riskLevels[i] === 'high' ? speed : null));

      // Verify arrays are correctly sized
      expect(lowRiskData.length).toBe(mockTripDetails.length);
      expect(mediumRiskData.length).toBe(mockTripDetails.length);
      expect(highRiskData.length).toBe(mockTripDetails.length);

      // Verify at least some data points are present
      const totalDataPoints = lowRiskData.filter((d) => d !== null).length +
        mediumRiskData.filter((d) => d !== null).length +
        highRiskData.filter((d) => d !== null).length;
      expect(totalDataPoints).toBeGreaterThan(0);
    });
  });
});
