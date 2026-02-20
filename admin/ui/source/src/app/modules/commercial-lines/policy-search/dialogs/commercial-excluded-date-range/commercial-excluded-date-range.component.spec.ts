import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ClExcludedDateRangeComponent } from "./commercial-excluded-date-range.component";

describe("ClExcludedDateRangeComponent", () => {
	let component: ClExcludedDateRangeComponent;
	let fixture: ComponentFixture<ClExcludedDateRangeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ClExcludedDateRangeComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(ClExcludedDateRangeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
