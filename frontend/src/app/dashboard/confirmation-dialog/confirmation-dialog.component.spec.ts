import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component'; 
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'; 
import { MatButtonModule } from '@angular/material/button'; 
import { CommonModule } from '@angular/common'; 

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatDialogModule, MatButtonModule, ConfirmationDialogComponent], // Importing the necessary modules for standalone component
      //declarations: [ConfirmationDialogComponent], // Declare the standalone component
      providers: [
        {
          provide: MAT_DIALOG_DATA, 
          useValue: { newStatus: 'resolved' } // Provide mock data for the dialog
        },
        {
          provide: MatDialogRef, 
          useValue: { newStatus: 'cancelled' } // Provide a mock MatDialogRef to prevent actual dialog interactions
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger change detection
  });

  it('should create the dialog component', () => {
    expect(component).toBeTruthy(); // Ensure the component is created
  });

  it('should display the correct status message', () => {
    // Select the element where the status is rendered
    const dialogMessage = fixture.nativeElement.querySelector('.mat-mdc-dialog-content');
    
    // Verify that the correct status is rendered from MAT_DIALOG_DATA
    expect(dialogMessage.textContent).toContain('resolve');
  });
});