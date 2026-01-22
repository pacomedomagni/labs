// menu-button-group-factory.ts
import { MenuButtonGroupItem } from './models/menu-button-group.models';

export class MenuButtonGroupFactory {
  
  static createButton(options: {
    id: string;
    label: string;
    disabled?: boolean;
    tooltip?: string;
  }): MenuButtonGroupItem {
    return {
      id: options.id,
      label: options.label,
      type: 'button',
      disabled: options.disabled ?? false,
      tooltip: options.tooltip,
      children: []
    };
  }

  static createGroupHeader(options: {
    id: string;
    label: string;
    children?: MenuButtonGroupItem[];
  }): MenuButtonGroupItem {
    return {
      id: options.id,
      label: options.label,
      type: 'group-header',
      children: options.children ?? []
    };
  }
}