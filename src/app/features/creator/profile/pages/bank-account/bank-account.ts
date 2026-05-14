import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as anime from 'animejs';
import { CardDetectionService, CardBrand } from '../../../../../core/services/card-detection.service';
import { Card } from '../../../../../shared/components/card/card';
import { CreatorService } from '../../../services/creator.service';
import Swal from 'sweetalert2';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-bank-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Card],
  templateUrl: './bank-account.html',
  styleUrls: ['./bank-account.css']
})
export class BankAccount implements OnInit {
  private fb = inject(FormBuilder);
  private creatorService = inject(CreatorService);
  private cardDetection = inject(CardDetectionService);
  private toastService = inject(ToastService);

  bankForm!: FormGroup;
  isLoading = signal(false);
  cardType = signal<CardBrand>('UNKNOWN');
  isCardValid = signal<boolean>(false);

  ngOnInit() {
    this.bankForm = this.fb.group({
      accountHolder: ['', Validators.required],
      bankName: ['', Validators.required], // Este se autocompletará
      accountType: ['CHECKING', Validators.required],
      accountNumber: ['', [Validators.required]],
      taxId: ['', Validators.required]
    });

    this.bankForm.get('accountNumber')?.valueChanges.subscribe((value) => {
      this.syncCardData(value || '');
    });

    this.bankForm.get('accountType')?.valueChanges.subscribe(() => {
      this.syncCardData(this.bankForm.get('accountNumber')?.value || '');
    });
  }

  syncCardData(rawValue: string): void {
    const cleanNum = this.cardDetection.cleanNumber(rawValue);
    const accountType = this.bankForm.get('accountType')?.value || 'CHECKING';
    const detectedBrand = this.cardDetection.detectBrand(cleanNum, accountType);
    const maxLength = this.cardDetection.maxLengthForBrand(detectedBrand);
    const trimmed = cleanNum.substring(0, maxLength);
    const formatted = this.formatAccountNumber(trimmed);

    if (rawValue !== formatted) {
      this.bankForm.get('accountNumber')?.setValue(formatted, { emitEvent: false });
    }

    this.isCardValid.set(this.cardDetection.isValid(trimmed, detectedBrand));

    if (detectedBrand !== this.cardType()) {
      this.cardType.set(detectedBrand);
      this.animateCardFlip();
    }

    const bankNameControl = this.bankForm.get('bankName');
    if (bankNameControl) {
      bankNameControl.setValue(detectedBrand === 'UNKNOWN' ? '' : detectedBrand, { emitEvent: false });
    }
  }

  animateCardFlip() {
    if (typeof (anime as any) !== 'function') return;
    (anime as any)({
      targets: '.bank-card',
      rotateY: '+=360',
      duration: 800,
      easing: 'easeInOutSine'
    });
  }

  formatAccountNumber(value: string): string {
    return value.replace(/(.{4})/g, '$1 ').trim();
  }

  getAccountNumberDisplay(): string {
    const number = this.bankForm.get('accountNumber')?.value || '';
    return this.formatAccountNumber(this.cardDetection.cleanNumber(number));
  }

  getAccountTypeLabel(): string {
    const type = this.bankForm.get('accountType')?.value;
    return type === 'SAVINGS' ? 'Ahorros' : 'Corriente';
  }

  onSubmit() {
    if (this.bankForm.invalid || !this.isCardValid()) return;
    this.isLoading.set(true);
    const payload = {
      ...this.bankForm.value,
      accountNumber: this.cardDetection.cleanNumber(this.bankForm.get('accountNumber')?.value || ''),
      bankName: this.cardType() === 'UNKNOWN' ? this.bankForm.get('bankName')?.value : this.cardType()
    };
    this.creatorService.saveBankAccount(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.showSuccess('Cuenta vinculada correctamente');
      },
      error: () => {
        this.isLoading.set(false);
        Swal.fire({
          icon: 'info',
          title: 'Cuenta ya registrada',
          text: 'Ya tienes una cuenta de banco registrada.'
        });
      }
    });
  }
}