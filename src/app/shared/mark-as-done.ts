import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { newclientapi } from '../services/newclient';
import { Notificationservice } from '../services/notificationservice';
import { AdminDataService } from './admin-data-service';

@Directive({
  selector: '[appMarkAsDone]',
  standalone: true,
})
export class MarkAsDoneDirective {
  @Input({ required: true }) clientId!: number;
  @Input({ required: true }) adminStatus!: string;
  @Input() confirmMessage = 'Are you sure to mark as done?';
  @Output() loadingChange = new EventEmitter<boolean>();
  constructor(
    private apiAdminService: newclientapi,
    private adminDataService: AdminDataService,
    private notify: Notificationservice
  ) { }

  @HostListener('change', ['$event'])
  async onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (!checkbox.checked) return;

    const confirmed = confirm(this.confirmMessage);
    if (!confirmed) {
      checkbox.checked = false;
      return;
    }

    this.loadingChange.emit(true);

    try {
      const response = await this.apiAdminService.markAsDone({
        clientId: this.clientId,
        adminStatus: this.adminStatus,
        updatedBy: ''
      }).toPromise();

      if (response === true) {
        console.log('api success');
        this.loadingChange.emit(false);
        this.notify.success(`${this.adminStatus} marked as done`);
      } else {
        console.log('api success and false');
        this.loadingChange.emit(false);
        this.notify.error('Failed to mark as done');
      }
    } catch (error: any) {
        console.log('api error');

      this.loadingChange.emit(false);
      console.error('Error:', error);
      this.notify.error(error.error?.message || 'An error occurred.');
    } finally {
        console.log('api finally');

      this.loadingChange.emit(false);
    }
  }

}
