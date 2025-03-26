
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsComponent } from './tabs.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { fakeAsync, flush, tick } from '@angular/core/testing';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatTabsModule,
        HttpClientTestingModule, // Importing HttpClientTestingModule for HTTP request mock
        TabsComponent
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify(); // Ensure there are no open HTTP requests after each test
  });

  it('should make a GET request to the correct endpoint for active status', fakeAsync(() => {
    const expectedResponse = [
    {
      "id": 1,
      "user_reporter": "Alex Right",
      "provider_name": "Facebook",
      "severity": "low",
      "location": "Johannesburg",
      "details": "An overwhelming sense of dread splashes over you like a wave.",
      "status": "active",
      "created_at": "2025-03-13T09:29:22.000Z",
      "updated_at": "2025-03-17T13:06:28.000Z"
    },
    {
      "id": 2,
      "user_reporter": "Louis Anderson",
      "provider_name": "LinkedIn",
      "severity": "critical",
      "location": "Pretoria",
      "details": "Dig deeper into the physicality of those sensations!",
      "status": "active",
      "created_at": "2025-03-13T09:50:40.000Z",
      "updated_at": "2025-03-17T12:52:28.000Z"
    }
  ];

    // Set the active tab to 'active' and trigger the request
    component.activeTab.next('active');
    fixture.detectChanges(); // Trigger change detection to ensure the data is updated

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/panics/active`); // Adjusted for active status
    expect(req.request.method).toBe('GET');

    // Simulating successful response
    req.flush(expectedResponse);

    tick(); // Simulate the passage of time for async operations

    // Verify that the data contains the expected response
    component.data.subscribe((data) => {
      expect(data).toEqual(expectedResponse);
    });

    // Complete the test by flushing all async operations
    flush();

    httpMock.verify(); // Verify no other HTTP requests were made
  }));

  it('should make a GET request to the correct endpoint for cancelled status', fakeAsync(() => {
    const expectedResponse = [
      {
        "id": 6,
        "user_reporter": "Olga Numando",
        "provider_name": "Municipality",
        "severity": "low",
        "location": "Limpopo",
        "details": "The wisest rule in investment is: when others are selling, buy.",
        "status": "cancelled",
        "created_at": "2025-03-14T10:52:05.000Z",
        "updated_at": "2025-03-17T11:49:06.000Z"
      },
      {
        "id": 9,
        "user_reporter": "Jane Smith",
        "provider_name": "Zombie Panic",
        "severity": "low",
        "location": "Hermanus",
        "details": "Let them express their feelings without interruption.",
        "status": "cancelled",
        "created_at": "2025-03-16T11:05:07.000Z",
        "updated_at": "2025-03-17T11:49:06.000Z"
      }
    ];
  
    // Simulate the initial GET request for the 'active' tab, which is fired in the constructor
    const initialRequest = httpMock.expectOne(`${environment.apiBaseUrl}/panics/active`);
    expect(initialRequest.request.method).toBe('GET');
    initialRequest.flush([]); // We simulate an empty response for the initial 'active' request
  
    // Now set the active tab to 'cancelled' and trigger the request
    component.activeTab.next('cancelled');
    
    // Trigger change detection to ensure component reacts to activeTab change
    fixture.detectChanges();
  
    // Expect the correct GET request for 'cancelled' tab
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/panics/cancelled`);
    expect(req.request.method).toBe('GET');
    
    // Simulate the successful response for the 'cancelled' request
    req.flush(expectedResponse);
  
    // Allow time for async operations and observable to emit
    tick();
  
    // Ensure the data contains the expected response
    component.data.subscribe((data) => {
      expect(data).toEqual(expectedResponse);
    });
  
    // Complete all pending async operations
    flush();
  
    // Verify that no other HTTP requests were made
    httpMock.verify(); 
  }));

  it('should make a GET request to the correct endpoint for resolved status', fakeAsync(() => {
    const expectedResponse = [    
      {
        "id": 5,
        "user_reporter": "Dutson Van Der Sar",
        "provider_name": "SBC News",
        "severity": "low",
        "location": "Port Elizabeth",
        "details": "Anxiety is love's greatest killer. It makes others feel as you might when a drowning man holds on to you.",
        "status": "resolved",
        "created_at": "2025-03-13T12:32:28.000Z",
        "updated_at": "2025-03-17T11:49:06.000Z"
      },
      {
        "id": 12,
        "user_reporter": "Sabrina Goumzer",
        "provider_name": "Weather Forecast",
        "severity": "critical",
        "location": "Johannesburg",
        "details": "If there is a serious weather situation that affects them they will be prepared.",
        "status": "resolved",
        "created_at": "2025-03-17T18:18:10.000Z",
        "updated_at": "2025-03-18T07:22:45.000Z"
      }
    ];

    // Simulate the initial GET request for the 'active' tab, which is fired in the constructor
    const initialRequest = httpMock.expectOne(`${environment.apiBaseUrl}/panics/active`);
    expect(initialRequest.request.method).toBe('GET');
    initialRequest.flush([]); // We simulate an empty response for the initial 'active' request

    // Set the active tab to 'resolved' and trigger the request
    component.activeTab.next('resolved');

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/panics/resolved`); // Adjusted for resolved status
    expect(req.request.method).toBe('GET');
    req.flush(expectedResponse); // Simulating successful response

    tick(); // Simulate the passage of time for async operations

    // Verify that the data contains the expected response
    component.data.subscribe((data) => {
      expect(data).toEqual(expectedResponse);
    });

    //Complete the test by flushing all async operations
    flush();

    httpMock.verify(); // Verify no other HTTP requests were made
  }));

  it('should handle an error response gracefully', fakeAsync(() => {
    const errorMessage = 'Network error';
  
    // Set the active tab to 'active' and trigger the request
    component.activeTab.next('active');
  
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/panics/active`);
    expect(req.request.method).toBe('GET');
    
    // Simulate network error
    req.error(new ErrorEvent('NetworkError', { message: errorMessage }));
  
    // Simulate the passage of time for async operations
    tick();
  
    // Ensure that no data is emitted when there's an error
    component.data.subscribe((data) => {
      expect(data).toEqual([]);  // Since the return is an empty array on error
    });
  
    // Complete the test by flushing all async operations
    flush();
  
    // Verify no other HTTP requests were made
    httpMock.verify();
  }));
});