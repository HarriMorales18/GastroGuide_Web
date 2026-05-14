import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreatorService } from '../../../services/creator.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-settings.html',
  styleUrls: ['./profile-settings.css']
})
export class ProfileSettings implements OnInit {
  private fb = inject(FormBuilder);
  private creatorService = inject(CreatorService);

  profileForm!: FormGroup;
  isEditing = signal(false);
  isLoading = signal(true);
  creatorId = signal<string>('');
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);

  ngOnInit() {
    this.initForm();
    this.loadProfile();
  }

  initForm() {
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      displayName: [{ value: '', disabled: true }],
      phoneNumber: [{ value: '', disabled: true }],
      nationality: [{ value: '', disabled: true }],
      bio: [{ value: '', disabled: true }],
      specialization: [{ value: '', disabled: true }],
      birthDate: [{ value: '', disabled: true }]
    });
  }

  loadProfile() {
    this.creatorService.getProfile().subscribe({
      next: (data) => {
        this.creatorId.set(data.creatorId);
        this.profileForm.patchValue(data);
        this.imagePreview.set(data.avatarUrl);
        this.isLoading.set(false);
      }
    });
  }

  toggleEdit() {
    if (this.isEditing()) {
      this.saveChanges();
    } else {
      this.isEditing.set(true);
      this.profileForm.enable();
      this.profileForm.get('email')?.disable(); // El email normalmente no se deja editar
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.profileForm.disable();
    this.selectedFile = null;
    this.loadProfile();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    // Nota: Si el backend espera JSON puro, usamos this.profileForm.getRawValue()
    // Si esperas subir la imagen en la misma petición, usaríamos FormData
    const payload = {
      ...this.profileForm.getRawValue(),
      avatarUrl: this.imagePreview() // O la lógica de subida de archivo que definas
    };

    this.creatorService.updateProfile(this.creatorId(), payload).subscribe({
      next: () => {
        this.isEditing.set(false);
        this.profileForm.disable();
        this.selectedFile = null;
        this.isLoading.set(false);
        alert('Perfil actualizado con éxito');
      },
      error: () => this.isLoading.set(false)
    });
  }
}