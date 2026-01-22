import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "./confirmation-dialog.component";

describe("ConfirmationDialogComponent", () => {
	let component: ConfirmationDialogComponent;
	let fixture: ComponentFixture<ConfirmationDialogComponent>;

	beforeEach(async () => {
		const mockData = {
			cancelText: "Cancel",
			confirmText: "Confirm",
			message: "Test message",
			title: "Test title",
			subtitle: "Test subtitle",
			hideCancelButton: false,
			alignTextLeft: false,
			helpKey: "test-help"
		};
		const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);

		await TestBed.configureTestingModule({
			imports: [ConfirmationDialogComponent],
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: mockData },
				{ provide: MatDialogRef, useValue: mockDialogRef }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfirmationDialogComponent);
		component = fixture.componentInstance;
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
