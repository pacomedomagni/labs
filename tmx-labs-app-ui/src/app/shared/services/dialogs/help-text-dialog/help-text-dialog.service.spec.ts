import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HelpTextDialogService } from './help-text-dialog.service';
import { HelpTextDialogComponent } from '../../../components/dialogs/help-text-dialog/help-text-dialog.component';
import { HelpTextDialogOptions } from '../dialogs.models';
import { CUI_DIALOG_WIDTH } from '@pgr-cla/core-ui-components';

describe('HelpTextDialogService', () => {
  let service: HelpTextDialogService;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<HelpTextDialogComponent, void>>;

  beforeEach(() => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        HelpTextDialogService,
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    });

    service = TestBed.inject(HelpTextDialogService);
    matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    matDialog.open.and.returnValue(mockDialogRef);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openHelpTextDialog', () => {
    it('should open dialog with default options', () => {
      const helpTextData = {
        title: 'Test Title',
        content: 'Test content',
        subtitle: 'Test subtitle'
      };
      const options: HelpTextDialogOptions = { data: helpTextData };

      const result = service.openHelpTextDialog(options);

      expect(matDialog.open).toHaveBeenCalledWith(HelpTextDialogComponent, {
        width: CUI_DIALOG_WIDTH.SMALL,
        panelClass: 'cui-dialog',
        data: {
          confirmText: 'OK',
          message: helpTextData.content,
          title: helpTextData.title,
          subtitle: helpTextData.subtitle,
          alignTextLeft: undefined,
          component: undefined,
          componentData: undefined,
          hideCancelButton: true
        },
        autoFocus: true
      });
      expect(result).toBe(mockDialogRef);
    });
  });
});