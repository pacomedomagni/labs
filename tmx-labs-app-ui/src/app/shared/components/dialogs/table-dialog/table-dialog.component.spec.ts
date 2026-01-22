import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TableDialogComponent } from "./table-dialog.component";

@Component({ template: "" })
class DummyComponent {}

describe("TableDialogComponent", () => {
	let component: TableDialogComponent;
	let fixture: ComponentFixture<TableDialogComponent>;

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
			imports: [TableDialogComponent, DummyComponent],
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: mockData },
				{ provide: MatDialogRef, useValue: mockDialogRef }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(TableDialogComponent);
		component = fixture.componentInstance;
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
