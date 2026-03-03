import { NavigationEnd, Router } from "@angular/router";
import { BehaviorSubject, Observable, forkJoin } from "rxjs";
import { Component, Input, OnInit } from "@angular/core";
import { ParticipantJunction, SupportPolicy, TransactionAuditLog } from "@modules/shared/data/resources";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { filter, map, startWith } from "rxjs/operators";
import { PolicyHistoryService } from "../services/policy-history.service";

@UntilDestroy()
@Component({
    selector: "tmx-policy-history",
    templateUrl: "./policy-history.component.html",
    styleUrls: ["./policy-history.component.scss"],
    standalone: false
})
export class PolicyHistoryComponent implements OnInit {
	@Input() policyNumber: string;

	private policySubject: BehaviorSubject<SupportPolicy> =
		new BehaviorSubject<SupportPolicy>(undefined);
	private junctionSubject: BehaviorSubject<ParticipantJunction[]> =
		new BehaviorSubject<ParticipantJunction[]>(undefined);
	private auditSubject: BehaviorSubject<TransactionAuditLog[]> =
		new BehaviorSubject<TransactionAuditLog[]>(undefined);

	policy$: Observable<SupportPolicy> = this.policySubject.asObservable();
	junctionData$: Observable<ParticipantJunction[]> =
		this.junctionSubject.asObservable();
	auditLogs$: Observable<TransactionAuditLog[]> =
		this.auditSubject.asObservable();

	constructor(private policyHistoryService: PolicyHistoryService,	private router: Router) {
		this.router.events
			.pipe(
				filter((event) => event instanceof NavigationEnd),
				startWith(this.router),
				map(() => this.router.getCurrentNavigation()?.extras.state),
				untilDestroyed(this)
			)
			.subscribe((x) => (this.policyNumber = x?.policyNumber));
	}

	ngOnInit(): void {
		if (this.policyNumber) {
			this.search(this.policyNumber);
		}
	}

	search(policyNumber: string): void {
		forkJoin([
			this.policyHistoryService.getPolicyInfo(policyNumber),
			this.policyHistoryService.getParticipantJunctionInfo(policyNumber),
			this.policyHistoryService.getTransactionAuditLogs(policyNumber)
		]).subscribe((x) => {
			this.policySubject.next(x[0]);
			this.junctionSubject.next(x[1]);
			this.auditSubject.next(x[2]);
		});
	}

	hasPolicy(): boolean {
		return this.policySubject.value !== undefined;
	}

	public getParticipantJunctionInfoCsvFileExport() :void
	{
		this.policyHistoryService.getParticipantJunctionInfoFile(this.policyNumber).subscribe((response: Blob) => {
			const blob = new Blob([response], { type: "application/octet-stream" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = this.policyNumber.toString() + ".csv";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		});
	}

	public getTransAuditLogCsvFileExport() :void
	{
		this.policyHistoryService.getTransactionAuditLogsFile(this.policyNumber).subscribe((response: Blob) => {
			const blob = new Blob([response], { type: "application/octet-stream" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = this.policyNumber.toString() + ".csv";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		});
	}
}
