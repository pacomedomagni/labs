import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { InformationDialogComponent } from "./information-dialog.component";

@Component({ template: "" })
class DummyComponent {}

describe("InformationDialogComponent", () => {
	let component: InformationDialogComponent;
	let fixture: ComponentFixture<InformationDialogComponent>;

	beforeEach(async () => {
		const mockData = {
			confirmText: "OK",
			cancelText: "Cancel",
			component: DummyComponent,
			componentData: {},
			title: "Test Title",
			subtitle: "Test Subtitle",
			hideCancelButton: false,
			helpKey: "test-help"
		};
		const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);

		await TestBed.configureTestingModule({
			imports: [InformationDialogComponent, DummyComponent],
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: mockData },
				{ provide: MatDialogRef, useValue: mockDialogRef }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(InformationDialogComponent);
		component = fixture.componentInstance;
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
