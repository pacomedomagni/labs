import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CustomerDetailsEditComponent } from "./customer-details-edit.component";
import { NgForm } from "@angular/forms";
import { FORM_DIALOG_CONTENT } from "src/app/shared/components/dialogs/form-dialog/form-dialog.component";

describe("CustomerDetailsEditComponent", () => {
  let component: CustomerDetailsEditComponent;
  let fixture: ComponentFixture<CustomerDetailsEditComponent>;

  beforeEach(async () => {
    const mockInjectedData = {
      data: { appExpirationDate: new Date() },
      model: {},
      form: {
        addControl: jasmine.createSpy("addControl"),
      } as unknown as NgForm,
    };

    await TestBed.configureTestingModule({
      imports: [CustomerDetailsEditComponent],
      providers: [
        { provide: FORM_DIALOG_CONTENT, useValue: mockInjectedData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsEditComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
