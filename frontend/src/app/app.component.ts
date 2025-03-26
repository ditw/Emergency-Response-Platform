import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './dashboard/tabs/tabs.component';
import { FooterComponent } from './layout/footer/footer.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    TabsComponent,
    FooterComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Emergency Response Platform - Dashboard';
}
