import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';
import { LoadingService } from '../../services/infrastructure/loading/loading.service';
import { BehaviorSubject } from 'rxjs';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;
  let loadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    const loadingSubject = new BehaviorSubject<boolean>(false);
    
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['startLoading', 'stopLoading'], {
      loading$: loadingSubject.asObservable(),
      isLoading: jasmine.createSpy('isLoading').and.returnValue(false)
    });

    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [
        { provide: LoadingService, useValue: loadingServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject LoadingService', () => {
    expect(component.loadingService).toBeDefined();
    expect(component.loadingService).toBe(loadingService);
  });

  it('should have public access to loadingService', () => {
    expect(component.loadingService).toBe(loadingService);
  });
});
