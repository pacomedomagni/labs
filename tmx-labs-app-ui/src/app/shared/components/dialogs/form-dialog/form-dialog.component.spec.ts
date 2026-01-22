import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormDialogComponent } from "./form-dialog.component";

@Component({ template: "" })
class DummyComponent {}

describe("FormDialogComponent", () => {
	let component: FormDialogComponent;
	let fixture: ComponentFixture<FormDialogComponent>;

	beforeEach(async () => {
		const mockData = {
			cancelText: "Cancel",
			component: DummyComponent,
			componentData: {},
			confirmText: "Confirm",
			formModel: {},
			title: "Test Title",
			subtitle: "Test Subtitle",
			manualSubmission: false,
			helpKey: "test-help"
		};
		const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);

		await TestBed.configureTestingModule({
			imports: [FormDialogComponent, DummyComponent],
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: mockData },
				{ provide: MatDialogRef, useValue: mockDialogRef }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(FormDialogComponent);
		component = fixture.componentInstance;
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
