import { TestBed } from "@angular/core/testing";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import { StaticDataService } from "./static-data.service";

describe("StaticDataService", () => {
	let service: StaticDataService;

	beforeEach(() => {
		const httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'request']);
		const sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['sanitize']);

		TestBed.configureTestingModule({
			providers: [
				StaticDataService,
				{ provide: HttpClient, useValue: httpSpy },
				{ provide: DomSanitizer, useValue: sanitizerSpy }
			]
		});

		service = TestBed.inject(StaticDataService);
	});

	it("should create", () => {
		expect(service).toBeTruthy();
	});
});
