import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { MatTabsModule } from '@angular/material/tabs';
import { of } from 'rxjs';
import { DataTableComponent } from '../data-table/data-table.component';
import { Panic } from '../../interfaces/panic.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, MatTabsModule, DataTableComponent],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent {
  apiUrl = `${environment.apiBaseUrl}/panics`;
  activeTab = new BehaviorSubject<string>('active'); // Track the currently selected tab
  data: Observable<Panic[]>; // Properly typed as Observable<Panic[]>

  constructor(private http: HttpClient) {
    // Fetch data whenever the activeTab changes
    this.data = this.activeTab.pipe(
      distinctUntilChanged(), // Avoid duplicate API calls for the same tab
      switchMap((tab) => this.fetchData(tab).pipe(
        catchError((err) => {
          // console.error(err);
          return of([]);  // Return an empty array on error
        }),
      )), // Fetch data based on the tab
      shareReplay(1) // Cache the latest response
    );
  }

  onTabClick(tab: string): void {
    this.activeTab.next(tab); // Update the current tab
  }

  private fetchData(tab: string): Observable<Panic[]> {
    // Construct the API URL using the environment variable
    const url = `${this.apiUrl}/${tab}`;
    return this.http.get<Panic[]>(url); // Expecting the response as Panic[]
  }
}