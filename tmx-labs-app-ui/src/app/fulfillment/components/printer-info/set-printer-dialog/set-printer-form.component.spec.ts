import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetPrinterFormComponent, PrinterFormModel } from './set-printer-form.component';
import { FORM_DIALOG_CONTENT } from '../../../../shared/components/dialogs/form-dialog/form-dialog.component';
import { NgForm } from '@angular/forms';

describe('SetPrinterFormComponent', () => {
  let component: SetPrinterFormComponent;
  let fixture: ComponentFixture<SetPrinterFormComponent>;
  const mockFormModel: PrinterFormModel = {
    selectedPrinter: ''
  };
  const mockForm = new NgForm([], []);
  const mockAvailablePrinters = ['Printer1', 'Printer2', 'Printer3'];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetPrinterFormComponent],
      providers: [
        { 
          provide: FORM_DIALOG_CONTENT, 
          useValue: { 
            model: mockFormModel, 
            form: mockForm, 
            data: { availablePrinters: mockAvailablePrinters, selectedPrinter: '' } 
          } 
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SetPrinterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have available printers list', () => {
    expect(component.availablePrinters().length).toBeGreaterThan(0);
  });

  it('should bind to printer details', () => {
    expect(component.printerDetails).toBe(mockFormModel);
  });
});
