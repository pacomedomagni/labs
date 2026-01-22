import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'tmx-swap-devices-unable',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './swap-devices-unable.component.html',
    styleUrls: ['./swap-devices-unable.component.scss'],
})
export class SwapDevicesUnableComponent {}
