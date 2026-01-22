import {
    ChangeDetectionStrategy,
    Component,
    computed,
    EventEmitter,
    input,
    Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MenuButtonGroupItem } from './models/menu-button-group.models';

@Component({
    selector: 'tmx-menu-button-group',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
    templateUrl: './menu-button-group.component.html',
    styleUrls: ['./menu-button-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuButtonGroupComponent {
    actions = input<MenuButtonGroupItem[]>([]);

    hasActions = computed(() => this.actions().length > 0);

    @Output() actionClicked = new EventEmitter<MenuButtonGroupItem>();

    onActionClick(action: MenuButtonGroupItem): void {
        if (!action.disabled && action.type === 'button') {
            this.actionClicked.emit(action);
        }
    }

    hasChildren(action: MenuButtonGroupItem): boolean {
        return action.children && action.children.length > 0;
    }

    isButton(action: MenuButtonGroupItem): boolean {
        return action.type === 'button';
    }

    isGroupHeader(action: MenuButtonGroupItem): boolean {
        return action.type === 'group-header';
    }

    getValidChildren(action: MenuButtonGroupItem): MenuButtonGroupItem[] {
        return action.children?.filter((child) => child && child.id) || [];
    }

    hasValidChildren(action: MenuButtonGroupItem): boolean {
        const validChildren = this.getValidChildren(action);
        return validChildren.length > 0;
    }
}
