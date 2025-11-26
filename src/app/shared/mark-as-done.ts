import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';
import { newclientapi } from '../services/newclient';
import { Notificationservice } from '../services/notificationservice';
import { AdminDataService } from './admin-data-service';
import { finalize } from 'rxjs';
import { AdminStatusOutput } from '../model/ClientManagement';

@Directive({
  selector: '[appMarkAsDone]',
  standalone: true,
})
export class MarkAsDoneDirective {
  @Input({ required: true }) clientId!: number;
  @Input({ required: true }) adminStatus!: string;
  @Input({ required: true }) adminScreen!: string;
  @Input() confirmMessage = 'Are you sure to mark as done?';
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() messageChange = new EventEmitter<string>();
  @Output() checkedChange = new EventEmitter<boolean>();
  private tooltipText: string = '';

  constructor(
    private apiAdminService: newclientapi,
    private adminDataService: AdminDataService,
    private notify: Notificationservice,
    private el: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.verifyStatusAndSetTooltip();
  }

  private verifyStatusAndSetTooltip() {
    // ✅ API #1 - Check eligibility
    this.apiAdminService
      .getAdminStatus(this.clientId)
      .subscribe({
        next: (adminStatus: AdminStatusOutput) => {
          setTimeout(() => {
            this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
            this.renderer.removeAttribute(this.el.nativeElement, 'checked');
            this.renderer.removeAttribute(this.el.nativeElement, 'title');

            if (this.adminScreen === 'photoUpload') {
              this.renderer.setProperty(this.el.nativeElement, 'disabled', adminStatus.photosUpload.isDisabled);
              this.renderer.setProperty(this.el.nativeElement, 'checked', adminStatus.photosUpload.isChecked);
              this.checkedChange.emit(adminStatus.photosUpload.isChecked); // Emit checked status
              this.setTooltip(adminStatus);
            }
            else if (this.adminScreen === 'loginInfo') {
              this.renderer.setProperty(this.el.nativeElement, 'disabled', adminStatus.loginInfo.isDisabled);
              this.renderer.setProperty(this.el.nativeElement, 'checked', adminStatus.loginInfo.isChecked);
              this.checkedChange.emit(adminStatus.loginInfo.isChecked); // Emit checked status
              this.setTooltip(adminStatus);

            }
            else if (this.adminScreen === 'photoDownload') {
              this.renderer.setProperty(this.el.nativeElement, 'disabled', adminStatus.photosDownload.isDisabled);
              this.renderer.setProperty(this.el.nativeElement, 'checked', adminStatus.photosDownload.isChecked);
              this.checkedChange.emit(adminStatus.photosDownload.isChecked); // Emit checked status
              this.setTooltip(adminStatus);

            }
            else if (this.adminScreen === 'reviewComments') {
              this.renderer.setProperty(this.el.nativeElement, 'disabled', adminStatus.reviewComment.isDisabled);
              this.renderer.setProperty(this.el.nativeElement, 'checked', adminStatus.reviewComment.isChecked);
              this.checkedChange.emit(adminStatus.reviewComment.isChecked); // Emit checked status
              this.setTooltip(adminStatus);

            }
          }, 0);

          this.cdr.detectChanges();

        },
        error: (err) => {
          setTimeout(() => {
            console.error('Error checking eligibility:', err);
            this.renderer.setProperty(this.el.nativeElement, 'disabled', false);
            this.renderer.setProperty(this.el.nativeElement, 'checked', false);
            this.tooltipText = 'Eligibility check failed. Please try again.';
            this.renderer.setAttribute(
              this.el.nativeElement,
              'title',
              this.tooltipText
            );
            this.cdr.detectChanges();

          }, 0);
        }
      });
  }

  private setTooltip(adminStatus: AdminStatusOutput) {
    if (this.adminScreen === 'photoUpload') {
      if (adminStatus.photosUpload.isDisabled && adminStatus.photosUpload.isChecked) {
        this.tooltipText = 'You have already marked Photos upload functionality as done.';
      }
    }
    else if (this.adminScreen === 'loginInfo') {
      if (adminStatus.loginInfo.isDisabled && adminStatus.loginInfo.isChecked) {
        this.tooltipText = 'You have already marked login info sent to client as done.';
      }
      else if (adminStatus.loginInfo.isDisabled && adminStatus.loginInfo.isChecked === false) {
        this.tooltipText = 'Please upload photos before marking login info as done.';
      }
    }
    else if (this.adminScreen === 'photoDownload') {
      if (adminStatus.photosDownload.isDisabled && adminStatus.photosDownload.isChecked) {
        this.tooltipText = 'You have already marked Photos download functionality as done.';
      }
      else if (adminStatus.photosDownload.isDisabled && adminStatus.photosDownload.isChecked === false) {
        this.tooltipText = 'Please send login info to client before marking photos download as done.';
      }
    }
    else if (this.adminScreen === 'reviewComments') {
      if (adminStatus.reviewComment.isDisabled && adminStatus.reviewComment.isChecked) {
        this.tooltipText = 'You have already marked reviewed comments functionality as done.';
      }
      else if (adminStatus.reviewComment.isDisabled && adminStatus.reviewComment.isChecked === false) {
        this.tooltipText = 'Please complete photos download before marking reviewed comments as done.';
      }
    }
    this.renderer.setAttribute(
      this.el.nativeElement,
      'title',
      this.tooltipText
    );
    this.messageChange.emit(this.tooltipText);
  }

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
        await this.verifyStatusAndSetTooltip();
        this.notify.success(`${this.adminStatus} marked as done`);
      } else {
        console.log('api success and false');
        this.notify.error('Failed to mark as done');
      }
    } catch (error: any) {
      console.log('api error');
      console.error('Error:', error);
      this.notify.error(error.error?.message || 'An error occurred.');
    } finally {
      console.log('api finally');
      this.loadingChange.emit(false);
    }
  }

}
