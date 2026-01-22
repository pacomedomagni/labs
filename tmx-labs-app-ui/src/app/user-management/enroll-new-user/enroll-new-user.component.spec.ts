import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OAuthStorage } from 'angular-oauth2-oidc';

import { EnrollNewUserComponent } from './enroll-new-user.component';

describe('EnrollNewUserComponent', () => {
  let component: EnrollNewUserComponent;
  let fixture: ComponentFixture<EnrollNewUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollNewUserComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: OAuthStorage,
          useValue: jasmine.createSpyObj('OAuthStorage', ['getItem', 'setItem', 'removeItem'])
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollNewUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should focus email address input when onStepperBackedOut is called', fakeAsync(() => {
    // Get the native input element
    const emailInput = fixture.nativeElement.querySelector('input[formControlName="emailAddress"]') as HTMLInputElement;
    expect(emailInput).toBeTruthy();

    // Spy on the focus method
    spyOn(emailInput, 'focus');

    // Call the method
    component.onStepperBackedOut();

    // Advance the timer to account for setTimeout
    tick();

    // Verify focus was called
    expect(emailInput.focus).toHaveBeenCalled();
  }));

  it('should set state to Initial when onStepperBackedOut is called', () => {
    // Set state to something other than Initial
    component['currentState'].set('ready-to-enroll' as any);
    expect(component.initialState()).toBe(false);

    // Call the method
    component.onStepperBackedOut();

    // Verify state changed to Initial
    expect(component.initialState()).toBe(true);
  });
});
