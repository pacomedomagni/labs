/* tslint:disable:deprecation */

export function isKeyAlphaNumeric(e: KeyboardEvent): boolean {
	return (e.keyCode >= 48 && e.keyCode <= 90) || (e.keyCode >= 96 && e.keyCode <= 105);
}

export function isKeyBackspaceOrDelete(e: KeyboardEvent): boolean {
	return e.keyCode === 8 || e.keyCode === 46;
}

/* tslint:enable:deprecation */
