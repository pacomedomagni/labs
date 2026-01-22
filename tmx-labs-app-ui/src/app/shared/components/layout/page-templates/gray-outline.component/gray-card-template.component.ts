import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '../../app-header/app-header.component';
import { TmxNotificationBannerComponent } from '../../../notification-banner/notification-banner.component';
@Component({
    selector: 'tmx-gray-card-template',
    imports: [
        RouterOutlet,
        AppHeaderComponent,
        TmxNotificationBannerComponent,
    ],
    templateUrl: './gray-card-template.component.html',
    styleUrl: './gray-card-template.component.scss',
})
export class GrayCardTemplateComponent {}