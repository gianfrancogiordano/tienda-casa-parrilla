import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss'
})
export class BottomSheetComponent {
  @Input() product: any;
  @Output() onConfirm = new EventEmitter<{ quantity: number; notes: string }>();
  @Output() onClose = new EventEmitter<void>();

  constructor(public api: PublicApiService) {}

  quantity: number = 1;
  notes: string = '';

  increment() {
    this.quantity++;
  }

  decrement() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  confirm() {
    this.onConfirm.emit({
      quantity: this.quantity,
      notes: this.notes
    });
    this.reset();
  }

  close() {
    this.onClose.emit();
    this.reset();
  }

  private reset() {
    this.quantity = 1;
    this.notes = '';
  }
}
