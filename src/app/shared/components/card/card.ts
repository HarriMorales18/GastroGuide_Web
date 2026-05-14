import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  @Input() brand: string = 'UNKNOWN';
  @Input() holder: string = '';
  @Input() number: string = '';
  @Input() accountType: string = '';
}
