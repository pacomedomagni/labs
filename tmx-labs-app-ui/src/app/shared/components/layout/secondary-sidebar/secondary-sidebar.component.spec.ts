import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecondarySidebarComponent } from './secondary-sidebar.component';
import { of } from 'rxjs';
import { UserInfoService } from '../../../services/user-info/user-info.service';
import { SecondarySidebarService } from '../../../services/secondary-sidebar/secondary-sidebar.service';

describe('SecondarySidebarComponent', () => {
  let component: SecondarySidebarComponent;
  let fixture: ComponentFixture<SecondarySidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecondarySidebarComponent],
      providers: [
        { provide: UserInfoService, useValue: { userInfo$: of({ lanId: 'test', name: 'Test' }), getUserAccess: () => true } },
        { provide: SecondarySidebarService, useValue: { config: () => ({ apps: [] }) } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondarySidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
