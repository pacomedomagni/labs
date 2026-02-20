import {
	trigger,
	animate,
	transition,
	style,
	query as q,
	animateChild,
	group,
	state
} from "@angular/animations";

const query = (s, a, o = { optional: true }) => q(s, a, o);

export const routeAnimation = trigger("routeAnimation", [
	transition("* => *", [
		query(":enter, :leave", style({ position: "fixed", width: "100%", height: "100%" })),
		query(":enter", [style({ opacity: 0 })]),
		group([
			query(":leave", [style({ opacity: 1 }), animate("0s", style({ opacity: 0 }))]),
			query(":enter", [style({ opacity: 0 }), animate("0.3s", style({ opacity: 1 })), animateChild()])
		])
	])
]);

export const fadeAnimation = trigger("fadeAnim", [

	// the "in" style determines the "resting" state of the element when it is visible.
	state("*", style({ opacity: 1 })),

	// fade in when created. this could also be written as transition('void => *')
	transition(":enter", [
		style({ opacity: 0 }),
		animate(600)
	]),

	// fade out when destroyed. this could also be written as transition('void => *')
	transition(":leave",
		animate(0, style({ opacity: 0 })))
]);

