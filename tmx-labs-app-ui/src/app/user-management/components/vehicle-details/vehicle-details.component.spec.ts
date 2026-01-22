import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { VehicleDetailsComponent } from './vehicle-details.component';
import { VehicleDetailsService } from '../../services/vehicle-details.service';
import { VehicleDetails } from 'src/app/shared/data/vehicle/resources';

describe('VehicleDetailsComponent', () => {
    let component: VehicleDetailsComponent;
    let fixture: ComponentFixture<VehicleDetailsComponent>;
    let vehicleDetailsService: jasmine.SpyObj<VehicleDetailsService>;

    const mockVehicle: VehicleDetails = {
        year: 2023,
        make: 'Toyota',
        model: 'Camry',
        scoringAlgorithm: {
            code: 1,
            description: 'Standard'
        }
    };

    const mockVehicles: VehicleDetails[] = [
        { 
            year: 2023, 
            make: 'Toyota', 
            model: 'Camry', 
            scoringAlgorithm: { code: 1, description: 'Standard' }
        },
        { 
            year: 2022, 
            make: 'Honda', 
            model: 'Civic', 
            scoringAlgorithm: { code: 2, description: 'Premium' }
        }
    ];

    beforeEach(async () => {
        const vehicleDetailsServiceSpy = jasmine.createSpyObj('VehicleDetailsService', [
            'addVehicle',
            'updateVehicle'
        ]);

        await TestBed.configureTestingModule({
            imports: [VehicleDetailsComponent, NoopAnimationsModule],
            providers: [
                { provide: VehicleDetailsService, useValue: vehicleDetailsServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(VehicleDetailsComponent);
        component = fixture.componentInstance;
        vehicleDetailsService = TestBed.inject(VehicleDetailsService) as jasmine.SpyObj<VehicleDetailsService>;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with empty data source', () => {
            expect(component.dataSource.data).toEqual([]);
            expect(component.displayedColumns).toEqual(['year', 'make', 'model', 'scoring_algo', 'actions']);
        });

        it('should have disabled property set to false by default', () => {
            expect(component.disabled).toBeFalse();
        });
    });

    describe('ControlValueAccessor Implementation', () => {
        it('should implement writeValue correctly', () => {
            component.writeValue(mockVehicles);
            
            expect(component.dataSource.data).toEqual(mockVehicles);
        });

        it('should handle null value in writeValue', () => {
            component.writeValue(null);
            
            expect(component.dataSource.data).toEqual([]);
        });

        it('should handle undefined value in writeValue', () => {
            component.writeValue(undefined!);
            
            expect(component.dataSource.data).toEqual([]);
        });

        it('should register onChange callback', () => {
            const mockOnChange = jasmine.createSpy('onChange');
            
            component.registerOnChange(mockOnChange);
            
            expect(mockOnChange).toBeDefined();
        });

        it('should register onTouched callback', () => {
            const mockOnTouched = jasmine.createSpy('onTouched');
            
            component.registerOnTouched(mockOnTouched);
            
            expect(mockOnTouched).toBeDefined();
        });
    });

    describe('addVehicle', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should add vehicle successfully', () => {
            const mockOnChange = jasmine.createSpy('onChange');
            const mockOnTouched = jasmine.createSpy('onTouched');
            component.registerOnChange(mockOnChange);
            component.registerOnTouched(mockOnTouched);
            
            vehicleDetailsService.addVehicle.and.returnValue(of(mockVehicle));
            
            component.addVehicle();
            
            expect(vehicleDetailsService.addVehicle).toHaveBeenCalled();
            expect(component.dataSource.data).toContain(mockVehicle);
            expect(mockOnChange).toHaveBeenCalledWith([mockVehicle]);
            expect(mockOnTouched).toHaveBeenCalled();
        });

        it('should handle null vehicle from service', () => {
            const mockOnChange = jasmine.createSpy('onChange');
            component.registerOnChange(mockOnChange);
            
            vehicleDetailsService.addVehicle.and.returnValue(of(null));
            
            component.addVehicle();
            
            expect(component.dataSource.data).toEqual([]);
            expect(mockOnChange).not.toHaveBeenCalled();
        });
    });

    describe('removeVehicle', () => {
        beforeEach(() => {
            component.writeValue(mockVehicles);
            fixture.detectChanges();
        });

        it('should remove vehicle at specified index', () => {
            const mockOnChange = jasmine.createSpy('onChange');
            const mockOnTouched = jasmine.createSpy('onTouched');
            component.registerOnChange(mockOnChange);
            component.registerOnTouched(mockOnTouched);
            
            component.removeVehicle(0);
            
            expect(component.dataSource.data).toEqual([mockVehicles[1]]);
            expect(mockOnChange).toHaveBeenCalledWith([mockVehicles[1]]);
            expect(mockOnTouched).toHaveBeenCalled();
        });

        it('should handle invalid index gracefully', () => {
            const originalLength = component.dataSource.data.length;
            
            component.removeVehicle(999);
            
            expect(component.dataSource.data.length).toBe(originalLength);
        });
    });

    describe('updateVehicle', () => {
        beforeEach(() => {
            component.writeValue(mockVehicles);
            fixture.detectChanges();
        });

        it('should update vehicle successfully', () => {
            const updatedVehicle: VehicleDetails = { 
                ...mockVehicle, 
                make: 'Updated Make',
                scoringAlgorithm: { code: 3, description: 'Updated Algorithm' }
            };
            const mockOnChange = jasmine.createSpy('onChange');
            const mockOnTouched = jasmine.createSpy('onTouched');
            component.registerOnChange(mockOnChange);
            component.registerOnTouched(mockOnTouched);
            
            vehicleDetailsService.updateVehicle.and.returnValue(of(updatedVehicle));
            
            component.updateVehicle(0, updatedVehicle);
            
            expect(vehicleDetailsService.updateVehicle).toHaveBeenCalledWith(updatedVehicle);
            expect(component.dataSource.data[0]).toEqual(updatedVehicle);
            expect(mockOnChange).toHaveBeenCalled();
            expect(mockOnTouched).toHaveBeenCalled();
        });

        it('should handle null response from update service', () => {
            const originalData = [...component.dataSource.data];
            vehicleDetailsService.updateVehicle.and.returnValue(of(null));
            
            component.updateVehicle(0, mockVehicle);
            
            expect(component.dataSource.data).toEqual(originalData);
        });
    });

    describe('Row Actions', () => {
        beforeEach(() => {
            component.writeValue(mockVehicles);
            fixture.detectChanges();
        });

        it('should call updateVehicle when onRowEdit is triggered', () => {
            spyOn(component, 'updateVehicle');
            
            component.onRowEdit(mockVehicles[0]);
            
            expect(component.updateVehicle).toHaveBeenCalledWith(0, mockVehicles[0]);
        });

        it('should call removeVehicle when onRowDelete is triggered', () => {
            spyOn(component, 'removeVehicle');
            
            component.onRowDelete(mockVehicles[1]);
            
            expect(component.removeVehicle).toHaveBeenCalledWith(1);
        });
    });

    describe('Data Source Management', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should update data source when vehicles change', () => {
            const initialLength = component.dataSource.data.length;
            vehicleDetailsService.addVehicle.and.returnValue(of(mockVehicle));
            
            component.addVehicle();
            
            expect(component.dataSource.data.length).toBe(initialLength + 1);
        });

        it('should call table.renderRows after data source update', () => {
            component.writeValue([mockVehicle]);
            fixture.detectChanges();
            
            spyOn(component.table, 'renderRows');
            vehicleDetailsService.addVehicle.and.returnValue(of(mockVehicle));
            
            component.addVehicle();
            
            expect(component.table.renderRows).toHaveBeenCalled();
        });
    });

    describe('Scoring Algorithm', () => {
        it('should handle vehicles with different scoring algorithms', () => {
            const vehicleWithDifferentAlgorithm: VehicleDetails = {
                year: 2024,
                make: 'Ford',
                model: 'F-150',
                scoringAlgorithm: {
                    code: 5,
                    description: 'Commercial'
                }
            };

            component.writeValue([mockVehicle, vehicleWithDifferentAlgorithm]);
            
            expect(component.dataSource.data[0].scoringAlgorithm.code).toBe(1);
            expect(component.dataSource.data[0].scoringAlgorithm.description).toBe('Standard');
            expect(component.dataSource.data[1].scoringAlgorithm.code).toBe(5);
            expect(component.dataSource.data[1].scoringAlgorithm.description).toBe('Commercial');
        });
    });
});
