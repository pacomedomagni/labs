import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavRailComponent } from './nav-rail.component';
import { AppDataService } from '../../../services/infrastructure/app-data-service/app-data.service';
import { SideSheetService } from '@pgr-cla/core-ui-components';
import { NavRailLinkItem } from './nav-rail-link-item';

describe('NavRailComponent', () => {
  let component: NavRailComponent;
  let fixture: ComponentFixture<NavRailComponent>;
  let appDataService: jasmine.SpyObj<AppDataService>;

  const mockNavLinks: NavRailLinkItem[] = [
    { route: '/home', label: 'Home', icon: 'home' } as NavRailLinkItem,
    { route: '/about', label: 'About', icon: 'info' } as NavRailLinkItem,
  ];

  beforeEach(async () => {
  const appDataServiceSpy = {
    shouldDisplayApplication: jasmine.createSpy('shouldDisplayApplication'),
    currentAppGroup: () => null,
  } as unknown as AppDataService;
  const sideSheetServiceStub = {} as SideSheetService;

    await TestBed.configureTestingModule({
      imports: [NavRailComponent],
      providers: [
        provideRouter([]),
        { provide: AppDataService, useValue: appDataServiceSpy },
  { provide: SideSheetService, useValue: sideSheetServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavRailComponent);
    component = fixture.componentInstance;
    appDataService = TestBed.inject(AppDataService) as jasmine.SpyObj<AppDataService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose nav links through the signal', () => {
  fixture.componentRef.setInput('navLinks', mockNavLinks);
  fixture.detectChanges();

  expect(component.navLinks()).toEqual(mockNavLinks);
  });

  it('should compute linksLoading based on nav links', () => {
    expect(component.linksLoading()).toBeTrue();

  fixture.componentRef.setInput('navLinks', mockNavLinks);
  fixture.detectChanges();

  expect(component.linksLoading()).toBeFalse();
  });

  it('should delegate shouldDisplay to AppDataService', () => {
    const link = mockNavLinks[0];
    appDataService.shouldDisplayApplication.and.returnValue(true);

    const result = component.shouldDisplay(link);

    expect(appDataService.shouldDisplayApplication).toHaveBeenCalledWith(link);
    expect(result).toBeTrue();
  });
});
