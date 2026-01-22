import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { inject, Injectable } from "@angular/core";
import { OAuthService } from "angular-oauth2-oidc";
import { UserInfoService } from "../services/user-info/user-info.service";

@Injectable({
    providedIn: 'root'
})
export class RolesAuthGuard implements CanActivate {
    private oauthService = inject(OAuthService);
    private userInfoService = inject(UserInfoService);
    private router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot ): boolean {
        // Check if user is authenticated first
        if (!this.oauthService.hasValidAccessToken()) {
            this.router.navigate(['/login']);
            return false;
        }

        // Get required roles from route data
        const requiredRoles: string[] = route.data?.['roles'] || [];
        
        if (requiredRoles.length === 0) {
            // No specific roles required, just need to be authenticated
            return true;
        }

        // Check access
        const hasAccess = this.userInfoService.getUserAccess(requiredRoles);

        if (hasAccess) {
            return true;
        }

        // Redirect to unauthorized page or dashboard
        this.router.navigate(['/unauthorized']);
        return false;
    }
}
