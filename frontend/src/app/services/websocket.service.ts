import { Injectable, OnDestroy, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private socket: Socket | null = null;

  constructor(private ngZone: NgZone) {}

  initializeConnection(): void {
    this.ngZone.run(() => {
      if (!this.socket) {
        if (environment.socketBaseUrl) {
            console.log('Initializing WebSocket connection to:', environment.socketBaseUrl);
            /** WebSocket connection initialization for the existing server */
            this.socket = io(environment.socketBaseUrl, {
                transports: ['websocket'], // Ensure WebSocket transport
                reconnection: true, // Auto-reconnect
            });
        }
      }
    });
  }

  onNewPanic(): Observable<any> {
    return new Observable((observer) => {
      if (!this.socket) {
        console.warn('Socket is not initialized yet!');
        return;
      }
  
      // Add event listener for 'new_panic'
      const listener = (panic: any) => {
        this.ngZone.run(() => {
          observer.next(panic);
        });
      };
      this.socket.on('new_panic', listener);
  
      // Cleanup when the observer unsubscribes
      return () => {
        this.socket?.off('new_panic', listener);
      };
    });
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}