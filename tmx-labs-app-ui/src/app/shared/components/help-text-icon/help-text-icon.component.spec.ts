import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { HelpTextIconComponent } from './help-text-icon.component';
import { HelpTextDialogService } from '../../services/dialogs/help-text-dialog/help-text-dialog.service';
import { HelpTextData } from '../../data/application/help-text/applications-help-text';
import { HelpTextType } from '../../data/application/help-text/help-text.enum';
import { HelpIcon } from '../../data/application/help-text/help-text-icon.enum';
import { HelpTextMap } from '../../data/application/help-text/help-text-map';

describe('HelpTextIconComponent', () => {
  let component: HelpTextIconComponent;
  let fixture: ComponentFixture<HelpTextIconComponent>;
  let helpTextDialogService: jasmine.SpyObj<HelpTextDialogService>;
  let windowSpy: jasmine.Spy;

  const mockHelpTextData: HelpTextData = {
    title: 'Test Help',
    content: 'Test help content',
    type: HelpTextType.Help,
    tooltip: 'Test tooltip'
  };

  beforeEach(async () => {
    const helpTextDialogServiceSpy = jasmine.createSpyObj('HelpTextDialogService', ['openHelpTextDialog']);
    windowSpy = spyOn(window, 'open');

    await TestBed.configureTestingModule({
      imports: [
        HelpTextIconComponent,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule
      ],
      providers: [
        { provide: HelpTextDialogService, useValue: helpTextDialogServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HelpTextIconComponent);
    component = fixture.componentInstance;
    helpTextDialogService = TestBed.inject(HelpTextDialogService) as jasmine.SpyObj<HelpTextDialogService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize help type properties', () => {
      spyOn(HelpTextMap, 'get').and.returnValue(mockHelpTextData);
      component.helpKey = 'test-help';

      component.ngOnInit();

      expect(component.type).toBe('help');
      expect(component.color).toBe('primary');
      expect(component.icon).toBe(HelpIcon.Help);
      expect(component.tooltip).toBe('Test tooltip');
    });

    it('should initialize alert type properties', () => {
      const alertData: HelpTextData = { ...mockHelpTextData, type: HelpTextType.Alert };
      spyOn(HelpTextMap, 'get').and.returnValue(alertData);
      component.helpKey = 'test-alert';

      component.ngOnInit();

      expect(component.type).toBe('alert');
      expect(component.color).toBe('warn');
      expect(component.icon).toBe(HelpIcon.Alert);
      expect(component.tooltip).toBe('Test tooltip');
    });

    it('should initialize notification type properties', () => {
      const notificationData: HelpTextData = { ...mockHelpTextData, type: HelpTextType.Notification };
      spyOn(HelpTextMap, 'get').and.returnValue(notificationData);
      component.helpKey = 'test-notification';

      component.ngOnInit();

      expect(component.type).toBe('notification');
      expect(component.color).toBe('primary');
      expect(component.icon).toBe(HelpIcon.Notification);
      expect(component.tooltip).toBe('Test help content');
    });

    it('should warn when help text not found', () => {
      spyOn(HelpTextMap, 'get').and.returnValue(undefined);
      spyOn(console, 'warn');
      component.helpKey = 'missing-key';

      component.ngOnInit();

      expect(console.warn).toHaveBeenCalledWith('Help text not found for key: missing-key');
    });

    it('should use default tooltip when helpTextData tooltip is not provided', () => {
      const dataWithoutTooltip: HelpTextData = { ...mockHelpTextData, tooltip: undefined };
      spyOn(HelpTextMap, 'get').and.returnValue(dataWithoutTooltip);
      component.helpKey = 'test-help';
      component.tooltip = 'Input tooltip';

      component.ngOnInit();

      expect(component.tooltip).toBe('Input tooltip');
    });

    it('should use fallback tooltip when neither helpTextData nor input tooltip provided', () => {
      const dataWithoutTooltip: HelpTextData = { ...mockHelpTextData, tooltip: undefined };
      spyOn(HelpTextMap, 'get').and.returnValue(dataWithoutTooltip);
      component.helpKey = 'test-help';

      component.ngOnInit();

      expect(component.tooltip).toBe('Learn More');
    });
  });

  describe('openHelpText', () => {
    beforeEach(() => {
      spyOn(HelpTextMap, 'get').and.returnValue(mockHelpTextData);
      component.helpKey = 'test-help';
      component.ngOnInit();
    });

    it('should open external URL when externalUrl is provided', () => {
      const dataWithExternalUrl: HelpTextData = { ...mockHelpTextData, externalUrl: 'https://example.com' };
      component['helpTextData'] = dataWithExternalUrl;

      component.openHelpText();

      expect(windowSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
      expect(helpTextDialogService.openHelpTextDialog).not.toHaveBeenCalled();
    });

    it('should open help dialog for help type', () => {
      component.openHelpText();

      expect(helpTextDialogService.openHelpTextDialog).toHaveBeenCalledWith({ data: mockHelpTextData });
      expect(windowSpy).not.toHaveBeenCalled();
    });

    it('should open help dialog for alert type', () => {
      const alertData: HelpTextData = { ...mockHelpTextData, type: HelpTextType.Alert };
      component['helpTextData'] = alertData;

      component.openHelpText();

      expect(helpTextDialogService.openHelpTextDialog).toHaveBeenCalledWith({ data: alertData });
    });

    it('should not open dialog for notification type', () => {
      const notificationData: HelpTextData = { ...mockHelpTextData, type: HelpTextType.Notification };
      component['helpTextData'] = notificationData;

      component.openHelpText();

      expect(helpTextDialogService.openHelpTextDialog).not.toHaveBeenCalled();
      expect(windowSpy).not.toHaveBeenCalled();
    });

    it('should not open anything when helpTextData is undefined', () => {
      component['helpTextData'] = undefined;

      component.openHelpText();

      expect(helpTextDialogService.openHelpTextDialog).not.toHaveBeenCalled();
      expect(windowSpy).not.toHaveBeenCalled();
    });
  });

  describe('Input properties', () => {
    it('should accept helpKey input', () => {
      component.helpKey = 'test-key';
      expect(component.helpKey).toBe('test-key');
    });

    it('should accept type input with default value', () => {
      expect(component.type).toBe('help');
      component.type = 'alert';
      expect(component.type).toBe('alert');
    });

    it('should accept tooltip input', () => {
      component.tooltip = 'Custom tooltip';
      expect(component.tooltip).toBe('Custom tooltip');
    });
  });
});