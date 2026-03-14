import moment from "moment";
import momentTZ  from "moment-timezone";
import { TimeSpan } from "../data/resources";

export class DateTimeUtils {
	constructor() { }
}

export function getTimeSpanFromSeconds(totalSeconds: number): TimeSpan {
	const hours = Math.floor(totalSeconds / 60 / 60);
	return {
		hours,
		minutes: Math.floor(totalSeconds / 60) - (hours * 60),
		seconds: totalSeconds % 60,
		totalSeconds
	} as TimeSpan;
}

export function getToday(): Date {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	return date;
}

export function getXAdjustedDays(offset: number, startDate?: Date): Date {
	const date = new Date(startDate ?? getToday());
	date.setDate(date.getDate() + offset);
	return date;
}

export function getTripDurationDisplay(tripDuration: TimeSpan): string {
	return zeroPad(tripDuration.hours, 2) + ":" +
		zeroPad(tripDuration.minutes, 2) + ":" +
		zeroPad(tripDuration.seconds, 2);
}

function zeroPad(num, places): string {
	const zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}

export function normalizeDateToEST(date: any): Date {
	const offset = -momentTZ.tz(new Date(), "America/New_York").utcOffset();
	const modded = moment(date);
	modded.add(offset + modded.utcOffset(), "minutes");
	return modded.toDate();
}
