import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleEditComponent } from './vehicle-edit.component';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VinPicklistService } from 'src/app/shared/services/api/vin-picklist/vin-picklist.service';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';

describe('VehicleEditComponent', () => {
  let component: VehicleEditComponent;
  let fixture: ComponentFixture<VehicleEditComponent>;
  let mockVinPicklistService: jasmine.SpyObj<VinPicklistService>;

  const mockInjectedData = {
    model: {
      vehicle: {
        year: 2022,
        make: 'Toyota',
        model: 'Camry',
        scoringAlgorithm: 'Standard',
      },
    },
    form: jasmine.createSpyObj('NgForm', ['addControl'])
  };

  const mockYearsResponse = {
    modelYear: ['2020', '2021', '2022', '2023', '2024'],
    extenders: [],
    messages: []
  };

  const mockAlgorithmsResponse = {
    scoringAlgorithms: [
      { code: 1, description: 'Standard' },
      { code: 2, description: 'Premium' }
    ],
    extenders: [],
    messages: []
  };

  const mockMakesResponse = {
    makes: ['Toyota', 'Honda', 'Ford'],
    extenders: [],
    messages: []
  };

  const mockModelsResponse = {
    models: ['Camry', 'Corolla', 'Prius'],
    extenders: [],
    messages: []
  };

  beforeEach(async () => {
    mockVinPicklistService = jasmine.createSpyObj('VinPicklistService', [
      'getVehicleYears',
      'getScoringAlgorithms',
      'getVehicleMakes',
      'getVehicleModels'
    ]);

    mockVinPicklistService.getVehicleYears.and.returnValue(of(mockYearsResponse));
    mockVinPicklistService.getScoringAlgorithms.and.returnValue(of(mockAlgorithmsResponse));
    mockVinPicklistService.getVehicleMakes.and.returnValue(of(mockMakesResponse));
    mockVinPicklistService.getVehicleModels.and.returnValue(of(mockModelsResponse));

    await TestBed.configureTestingModule({
      imports: [VehicleEditComponent, NoopAnimationsModule],
      providers: [
        { provide: VinPicklistService, useValue: mockVinPicklistService },
        { provide: FORM_DIALOG_CONTENT, useValue: mockInjectedData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleEditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with injected data', () => {
    component.ngOnInit();
    expect(component.vehicleDetails.vehicle.year).toEqual(mockInjectedData.model.vehicle.year);
    expect(component.vehicleDetails.vehicle.make).toEqual(mockInjectedData.model.vehicle.make);
    expect(component.vehicleDetails.vehicle.model).toEqual(mockInjectedData.model.vehicle.model);
    expect(component.parentForm).toEqual(mockInjectedData.form);
  });

  it('should load years and scoring algorithms on init', () => {
    component.ngOnInit();
    
    expect(mockVinPicklistService.getVehicleYears).toHaveBeenCalled();
    expect(mockVinPicklistService.getScoringAlgorithms).toHaveBeenCalled();
  });

  it('should load makes when year changes', () => {
    component.ngOnInit();
    component.yearChange('2022');
    
    expect(mockVinPicklistService.getVehicleMakes).toHaveBeenCalledWith('2022');
  });

  it('should load models when make changes', () => {
    component.ngOnInit();
    component.vehicleDetails.vehicle = { year: 2022, make: 'Toyota', model: '' };
    component.makeChange('Toyota');
    
    expect(mockVinPicklistService.getVehicleModels).toHaveBeenCalledWith('2022', 'Toyota');
  });
});
