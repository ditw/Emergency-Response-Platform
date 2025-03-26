import { trigger, style, transition, animate } from '@angular/animations';
import { Renderer2 } from '@angular/core';
/**
 * Apply fade animation to html element based on state (not in use)
 */
export const fadeAnimation = trigger('fade', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
    ])
]);
/**
 * Apply basic effect (animation and styles)  to a table element 
 * @param renderer: Renderer2
 * @param tabelId: string
 * @param tableElement: string
 * @param severityClass: string
 * @param severityClassType: string
 * @param timeout: number
 *  
 */
export const applyBasicEffect = (
    renderer: Renderer2, 
    tabelId: string, 
    tableElement: string, 
    severityClass: string,
    severityClassType: string,
    timeout: number) => {
    const tableBody = document.querySelector(`#${tabelId}`);
    if (tableBody) {
    // Get the last added row
    const rows = tableBody.querySelectorAll(tableElement);
    const lastRow = rows[rows.length - 1];

    if (lastRow) {
        renderer.addClass(lastRow, 'fade-in'); // Apply fadein transition
        renderer.addClass(lastRow, severityClass); // Apply severity style
        renderer.addClass(lastRow, severityClassType); // Apply style to match the severity type
        setTimeout(() => { 
            // Remove after animation and reset styles
            renderer.removeClass(lastRow, 'fade-in');
            renderer.removeClass(lastRow, severityClass);
            renderer.removeClass(lastRow, severityClassType);
            }, 
            timeout);
        }
    }
}
/**
 * Scroll to the bottom of the page/view
 */
export function scrollToBottom(): void {
    const options: ScrollToOptions = {
        top: document.body.scrollHeight + 50, // To balance the footer margin gap
        behavior: 'smooth'
    };

    window.scrollTo(options);
}