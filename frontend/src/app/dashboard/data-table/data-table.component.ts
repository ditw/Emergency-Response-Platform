import { Component, Input, Inject, PLATFORM_ID, ApplicationRef, SimpleChanges, Renderer2 } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon'; 
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
import { WebSocketService } from '../../services/websocket.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Panic } from '../../interfaces/panic.interface';
import { sortDataTable, toggleSortIcon } from '../../helpers/table-sort.helper';
import { applyBasicEffect, scrollToBottom } from '../../helpers/animation.helper';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  providers: [TitleCasePipe],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() data: Panic[] = []; // Dynamic data to load in the data table view based on the tab type
  @Input() tab: string = ""; // To check the tab type and receive messages only when the tab type is 'Active'
  loading: { [key: number]: boolean } = {}; // Track loading state for each panic
  private websocketSubscription!: Subscription;
  /**
   * For sorting the data by column (toggle sort)
   */
  sortedData: Panic[] = []; // Alter sort of data
  currentSortColumn: keyof Panic = 'created_at'; // A key from the Panic interface
  isAscending = true; // Default sort

  constructor(
    private http: HttpClient, 
    private dialog: MatDialog,  
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object,
    private appRef: ApplicationRef,
    private renderer: Renderer2,
    private titleCasePipe: TitleCasePipe,
    private webSocketService: WebSocketService) {}

  ngOnInit(): void { 
    /** 
     * To ensure that the application becomes stable when using WebSocket as it might take extra time for loading 
     * And to avoid initializing connection when no browser platform is detected (useful when SSR is used)
     */
    this.appRef.isStable.subscribe((isStable) => {
      if (isStable && isPlatformBrowser(this.platformId)) {
        this.webSocketService.initializeConnection();
        this.subscribeToWebSocket();
      }
    });
  }

  private subscribeToWebSocket(): void {
    /** 
     * Subscribe to real-time "new_panic" events 
     * This must be applied only for the active tab since the real-time update would be applied for the active panics only
     * According to the current logic
     */
    if (this.tab === 'Active') {
      // Subscribe to the WebSocket service for real-time updates
      this.websocketSubscription = this.webSocketService.onNewPanic().subscribe({
        next: (newPanic) => {
          //console.log('New panic received:', newPanic);
          const severityTitle = this.titleCasePipe.transform(newPanic.severity);
          // Show a toast notification for the new panic event
          this.snackBar.open(
            `Alert: New panic request received from ${newPanic.provider_name} with ${severityTitle} severity!`,
            '[X Close]',
            {
              duration: 7000, // Toast disappears after 7 seconds
              horizontalPosition: 'right',
              verticalPosition: 'top',
            }
          );
  
          /**
           * Update the data array with the new panic by adding the new panic record (tr) to the end of the table 
           * (since the panics are orderd by date asc)
           */ 
          this.data = [...this.data, newPanic];
  
          // Re-sort the data if necessary (if sort was applied already)
          this.sortedData = sortDataTable(this.data, this.currentSortColumn, this.isAscending);

          // Wait for the DOM to update and apply quick animation (UI utility)
          setTimeout(() => {
            scrollToBottom();
            applyBasicEffect(this.renderer, 'panicsListView', 'tr', 'severity', newPanic.severity, 1000);
          });
        },
        error: (err) => {
          console.error('Error in WebSocket subscription:', err);
        },
        complete: () => {
          console.log('WebSocket subscription completed.');
        },
      });
    }
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      // Update the data table view when changing the tab to reflect the correct sort
      this.sortedData = sortDataTable(this.data, this.currentSortColumn, this.isAscending);
    }
  }

  onSort(column: keyof Panic) { 
    if (this.currentSortColumn === column) {
      this.isAscending = !this.isAscending; // Toggle sort order
    } else {
      this.currentSortColumn = column;
      this.isAscending = true; // Default is ascending
    }

    this.sortedData = sortDataTable(this.data, column, this.isAscending);
  }

  showSortIcon(column: keyof Panic): string {
    return toggleSortIcon(this.currentSortColumn, this.isAscending, column);
  }

  trackByFn(index: number, panic: Panic): number | string {
    return panic.id || index; // Ensure unique row rendering
  }

  updateStatus(panic: Panic, newStatus: string): void {
    // Dialog message configuration for 'Cancel' and 'Resolve' actions
    const dialogReference = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {newStatus}
    });

    dialogReference.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.loading[panic.id] = true; // Show spinner
        const apiUrl = `${environment.apiBaseUrl}/panic/${panic.id}/status`;
        this.http.put(apiUrl, { status: newStatus }).subscribe({
          next: () => {
            panic.status = newStatus; // Update panic status
            this.loading[panic.id] = false; // Hide spinner
            this.data = this.data.filter(item => item.id !== panic.id); // Remove the panic from the current table sicne the status has changed
            this.sortedData = sortDataTable(this.data, this.currentSortColumn, this.isAscending);
          },
          error: (error) => {
            console.error(error); // Handle API errors
            this.loading[panic.id] = false; // Hide spinner
          }
        });
      }
    });
  }

  panicHasActiveStatus(): boolean {
    return this.data.some((panic) => panic.status === 'active');
  }  

  ngOnDestroy(): void {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
}