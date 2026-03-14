import { Injectable } from "@angular/core";
import { ApiService } from "@modules/core/services/_index";

@Injectable()
export class AccidentDetectionService {

	private readonly controller = "/CustomerService/AccidentDetection";

	constructor(private api: ApiService) { }

	unenrollParticipant(telematicsId: string, unenrollReason: string) {
		return this.api.post<void>({
			uri: `${this.controller}/Unenroll`,
			payload: { telematicsId, unenrollReason }
		});
	}
}
