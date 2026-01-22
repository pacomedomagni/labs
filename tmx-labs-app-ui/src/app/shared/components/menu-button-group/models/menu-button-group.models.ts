export interface MenuButtonGroupItem {
  id: string;
  label: string;
  disabled?: boolean;
  tooltip?: string;
  type: 'button' | 'group-header';
  children?: MenuButtonGroupItem[];
}