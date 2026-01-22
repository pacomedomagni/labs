import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpTextDialogComponent } from './help-text-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('HelpTextDialogComponent', () => {
    let component: HelpTextDialogComponent;
    let fixture: ComponentFixture<HelpTextDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HelpTextDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} }, // Add this mock
                { provide: MAT_DIALOG_DATA, useValue: {} }, // Add this mock
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HelpTextDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
