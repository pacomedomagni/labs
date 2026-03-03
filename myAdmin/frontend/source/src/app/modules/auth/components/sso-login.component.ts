import { Component, OnInit } from "@angular/core";

import { AuthService } from "../services/auth.service";

@Component({
    selector: "tmx-sso-login",
    template: `
	<tmx-auth-spinner></tmx-auth-spinner>
	`,
    standalone: false
})
export class SsoLoginComponent implements OnInit {

	constructor(private authService: AuthService) { }

	ngOnInit(): void {
		this.authService.login();
	}

}
