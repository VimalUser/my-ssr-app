import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-card-component.html',
  styleUrl: './image-card-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCardComponent {
  @Input() img!: string;
  @Input() albumSelected!: boolean;
  @Input() frameSelected!: boolean;
  @Input() coverSelected!: boolean;
  @Input() isSubmitted!: boolean;

  @Output() preview = new EventEmitter<string>();
  @Output() albumToggle = new EventEmitter<Event>();
  @Output() frameToggle = new EventEmitter<Event>();
  @Output() coverToggle = new EventEmitter<Event>();

  openPreview() {
    this.preview.emit(this.img);
  }
}
