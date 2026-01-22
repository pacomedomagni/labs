import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddNewVehicleComponent } from './add-new-vehicle.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { VinPicklistService } from 'src/app/shared/services/api/vin-picklist/vin-picklist.service';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import { NgForm } from '@angular/forms';
import { of } from 'rxjs';

describe('AddNewVehicleComponent', () => {
  let component: AddNewVehicleComponent;
  let fixture: ComponentFixture<AddNewVehicleComponent>;
  let vinPicklistServiceSpy: jasmine.SpyObj<VinPicklistService>;
  let mockForm: jasmine.SpyObj<NgForm>;

  const mockVehicleDetails = {
    year: '2023',
    make: 'Toyota',
    model: 'Camry',
    vin: '1234567890',
    extenders: [],
    messages: []
  };

  const mockYearsResponse = {
    modelYear: ['2023', '2022', '2021', '2020'],
    extenders: [],
    messages: []
  };

  const mockAlgorithmsResponse = {
    scoringAlgorithms: [
      { description: 'Algorithm A', id: 1, code: 2},
      { description: 'Algorithm B', id: 2, code: 1 }
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
    models: ['Camry', 'Corolla', 'Prius'],    extenders: [],
    messages: []
  };

  beforeEach(async () => {
    const authStorageSpy = jasmine.createSpyObj('OAuthStorage', ['getItem', 'setItem', 'removeItem']);
    vinPicklistServiceSpy = jasmine.createSpyObj('VinPicklistService', [
      'getVehicleYears',
      'getScoringAlgorithms',
      'getVehicleMakes',
      'getVehicleModels'
    ]);
    mockForm = jasmine.createSpyObj('NgForm', ['addControl']);

    // Setup service method returns
    vinPicklistServiceSpy.getVehicleYears.and.returnValue(of(mockYearsResponse));
    vinPicklistServiceSpy.getScoringAlgorithms.and.returnValue(of(mockAlgorithmsResponse));
    vinPicklistServiceSpy.getVehicleMakes.and.returnValue(of(mockMakesResponse));
    vinPicklistServiceSpy.getVehicleModels.and.returnValue(of(mockModelsResponse));

    await TestBed.configureTestingModule({
      imports: [
        AddNewVehicleComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OAuthStorage, useValue: authStorageSpy },
        { provide: VinPicklistService, useValue: vinPicklistServiceSpy },
        {
          provide: FORM_DIALOG_CONTENT,
          useValue: {
            model: mockVehicleDetails,
            form: mockForm
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddNewVehicleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});