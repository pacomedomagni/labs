import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogService } from './dialog.service';
import { ConfirmationDialogComponent } from '../../../components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { InformationDialogComponent } from '../../../components/dialogs/information-dialog/information-dialog.component';
import { FormDialogComponent } from '../../../components/dialogs/form-dialog/form-dialog.component';
import { DialogOptions, InformationDialogOptions, FormDialogOptions } from '../dialogs.models';
import { CUI_DIALOG_WIDTH } from '@pgr-cla/core-ui-components';

describe('DialogService', () => {
  let service: DialogService;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<unknown, unknown>>;

  beforeEach(() => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        DialogService,
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    });

    service = TestBed.inject(DialogService);
    matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    matDialog.open.and.returnValue(mockDialogRef);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openConfirmationDialog', () => {
    it('should open confirmation dialog with default options', () => {
      const options: DialogOptions = {
        title: 'Confirm Action',
        message: 'Are you sure?'
      };

      const result = service.openConfirmationDialog(options);

      expect(matDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
        width: CUI_DIALOG_WIDTH.SMALL,
        panelClass: 'cui-dialog',
        data: {
          cancelText: 'Cancel',
          confirmText: 'Yes',
          message: 'Are you sure?',
          title: 'Confirm Action',
          subtitle: undefined,
          hideCancelButton: false,
          alignTextLeft: false,
          helpKey: undefined
        },
        autoFocus: true
      });
      expect(result).toBeDefined();
    });

    it('should open confirmation dialog with custom options', () => {
      const options: DialogOptions = {
        title: 'Custom Title',
        subtitle: 'Custom Subtitle',
        message: 'Custom message',
        confirmText: 'Proceed',
        hideCancelButton: true,
        alignTextLeft: true,
        helpKey: 'test-help',
        width: '600px'
      };

      service.openConfirmationDialog(options);

      expect(matDialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
        width: '600px',
        panelClass: 'cui-dialog',
        data: {
          cancelText: 'Cancel',
          confirmText: 'Proceed',
          message: 'Custom message',
          title: 'Custom Title',
          subtitle: 'Custom Subtitle',
          hideCancelButton: true,
          alignTextLeft: true,
          helpKey: 'test-help'
        },
        autoFocus: true
      });
    });
  });

  describe('openInformationDialog', () => {
    it('should open information dialog with required options', () => {
      class TestComponent { }
      const options: InformationDialogOptions<TestComponent> = {
        title: 'Information',
        component: TestComponent
      };

      const result = service.openInformationDialog(options);

      expect(matDialog.open).toHaveBeenCalledWith(InformationDialogComponent, {
        width: CUI_DIALOG_WIDTH.SMALL,
        panelClass: 'cui-dialog',
        maxWidth: '80vw',
        height: '250px',
        maxHeight: '90vh',
        data: {
          component: TestComponent,
          componentData: undefined,
          subtitleComponent: undefined,
          subtitleComponentData: undefined,
          confirmText: 'Ok',
          cancelText: 'Cancel',
          title: 'Information',
          subtitle: undefined,
          hideCancelButton: false,
          helpKey: undefined,
          dialogContentClass: undefined
        },
        autoFocus: true
      });
      expect(result).toBeDefined();
      expect(matDialog.open).toHaveBeenCalledWith(InformationDialogComponent, jasmine.objectContaining({
        data: jasmine.any(Object),
        autoFocus: true
      }));
    });

    it('should open information dialog with all options', () => {
      class TestComponent { }
      const options: InformationDialogOptions<TestComponent> = {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        component: TestComponent,
        componentData: { testData: 'value' },
        width: '800px',
        helpKey: 'info-help',
        hideCancelButton: true
      };

      service.openInformationDialog(options);

      expect(matDialog.open).toHaveBeenCalledWith(InformationDialogComponent, {
        width: '800px',
        panelClass: 'cui-dialog',
        maxWidth: '80vw',
        height: '250px',
        maxHeight: '90vh',
        data: {
          component: TestComponent,
          componentData: { testData: 'value' },
          subtitleComponent: undefined,
          subtitleComponentData: undefined,
          confirmText: 'Ok',
          cancelText: 'Cancel',
          title: 'Test Title',
          subtitle: 'Test Subtitle',
          hideCancelButton: true,
          helpKey: 'info-help',
          dialogContentClass: undefined
        },
        autoFocus: true
      });
    });
  });

  describe('openFormDialog', () => {
    it('should open form dialog with required options', () => {
      class TestFormComponent { }
      const formModel = { testField: 'value' };
      const options: FormDialogOptions<TestFormComponent> = {
        title: 'Form Dialog',
        component: TestFormComponent,
        formModel: formModel
      };

      const result = service.openFormDialog(options);

      expect(matDialog.open).toHaveBeenCalledWith(FormDialogComponent, {
        width: CUI_DIALOG_WIDTH.SMALL,
        panelClass: 'cui-dialog',
        data: {
          component: TestFormComponent,
          componentData: undefined,
          cancelText: 'Cancel',
          confirmText: 'Ok',
          formModel: formModel,
          title: 'Form Dialog',
          subtitle: undefined,
          manualSubmission: undefined,
          helpKey: undefined
        },
        autoFocus: true
      });
      expect(result).toBeDefined();
      expect(matDialog.open).toHaveBeenCalledWith(FormDialogComponent, jasmine.objectContaining({
        data: jasmine.any(Object),
        autoFocus: true
      }));
    });

    it('should open form dialog with all options', () => {
      class TestFormComponent { }
      const formModel = { testField: 'value' };
      const options: FormDialogOptions<TestFormComponent> = {
        title: 'Custom Form',
        subtitle: 'Form Subtitle',
        component: TestFormComponent,
        confirmText: 'Submit',
        formModel: formModel,
        componentData: { customData: 'test' },
        width: '900px',
        manualSubmission: true,
        helpKey: 'form-help'
      };

      service.openFormDialog(options);

      expect(matDialog.open).toHaveBeenCalledWith(FormDialogComponent, {
        width: '900px',
        panelClass: 'cui-dialog',
        data: {
          component: TestFormComponent,
          componentData: { customData: 'test' },
          cancelText: 'Cancel',
          confirmText: 'Submit',
          formModel: formModel,
          title: 'Custom Form',
          subtitle: 'Form Subtitle',
          manualSubmission: true,
          helpKey: 'form-help'
        },
        autoFocus: true
      });
    });
  });

  describe('openDialog', () => {
    it('should open dialog with default config', () => {
      class TestComponent { }

      const result = service.openDialog(TestComponent);

      expect(matDialog.open).toHaveBeenCalledWith(TestComponent, {
        width: CUI_DIALOG_WIDTH.SMALL,
        panelClass: 'cui-dialog',
        data: {},
        autoFocus: true
      });
      expect(result).toBe(mockDialogRef);
    });

    it('should open dialog with custom config', () => {
      class TestComponent { }
      const customConfig = {
        width: '700px',
        data: { customData: 'test' },
        disableClose: true
      };

      service.openDialog(TestComponent, customConfig);

      expect(matDialog.open).toHaveBeenCalledWith(TestComponent, {
        width: '700px',
        data: { customData: 'test' },
        disableClose: true,
        autoFocus: true
      });
    });

    it('should always set autoFocus to true', () => {
      class TestComponent { }
      const configWithoutAutoFocus = { 
        width: '400px',
        autoFocus: false
      };

      service.openDialog(TestComponent, configWithoutAutoFocus);

      expect(matDialog.open).toHaveBeenCalledWith(TestComponent, jasmine.objectContaining({
        autoFocus: true
      }));
    });
  });
});
