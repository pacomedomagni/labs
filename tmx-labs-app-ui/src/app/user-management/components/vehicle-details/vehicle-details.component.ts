import { CommonModule } from '@angular/common';
import { Component, DestroyRef, forwardRef, inject, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { VehicleDetailsService } from '../../services/vehicle-details.service';
import { VehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'tmx-vehicle-details',
    imports: [MatTableModule, CommonModule, MatButtonModule, MatIcon],
    templateUrl: './vehicle-details.component.html',
    styleUrl: './vehicle-details.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => VehicleDetailsComponent),
            multi: true,
        },
    ],
})
export class VehicleDetailsComponent implements ControlValueAccessor {
    private readonly vehicleDetailService = inject(VehicleDetailsService);
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild(MatTable) table!: MatTable<VehicleDetails>;

    displayedColumns: string[] = ['year', 'make', 'model', 'scoring_algo', 'actions'];
    dataSource = new MatTableDataSource<VehicleDetails>([]);

    private vehicles: VehicleDetails[] = [];
    disabled = false;

    // ControlValueAccessor callbacks
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onChange = (_value: VehicleDetails[]): void => {
        // This will be replaced by registerOnChange
    };
    private onTouched = (): void => {
        // This will be replaced by registerOnTouched
    };

    // ControlValueAccessor implementation
    writeValue(value: VehicleDetails[]): void {
        this.vehicles = value || [];
        this.dataSource.data = this.vehicles;
    }

    registerOnChange(fn: (value: VehicleDetails[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Actions
    onRowEdit(row: VehicleDetails) {
        this.updateVehicle(this.vehicles.indexOf(row), row);
    }

    onRowDelete(row: VehicleDetails) {
        this.removeVehicle(this.vehicles.indexOf(row));
    }

    // Component methods
    addVehicle(): void {
        this.vehicleDetailService
            .addVehicle()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((vehicle) => {
                if (vehicle) {
                    this.vehicles = [...this.vehicles, vehicle];
                    this.updateDataSource();
                    this.onChange(this.vehicles);
                    this.onTouched();
                }
            });
    }

    removeVehicle(index: number): void {
        this.vehicles = this.vehicles.filter((_, i) => i !== index);
        this.updateDataSource();
        this.onChange(this.vehicles);
        this.onTouched();
    }

    updateVehicle(index: number, vehicle: VehicleDetails): void {
        this.vehicleDetailService
            .updateVehicle(vehicle)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((updatedVehicle) => {
                if (updatedVehicle) {
                    this.vehicles[index] = updatedVehicle;
                    this.updateDataSource();
                    this.onChange(this.vehicles);
                    this.onTouched();
                }
            });
    }

    private updateDataSource(): void {
        this.dataSource.data = [...this.vehicles];
        this.table.renderRows();
    }
}
