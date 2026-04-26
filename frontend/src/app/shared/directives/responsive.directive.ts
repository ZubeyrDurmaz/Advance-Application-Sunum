import { Directive, Input, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { ResponsiveService, Breakpoint } from '../../core/services/responsive.service';

/**
 * Structural directive for conditional rendering based on viewport breakpoint.
 * 
 * Usage:
 * ```html
 * <div *appShowOn="'mobile'">Only visible on mobile</div>
 * <div *appShowOn="'tablet'">Only visible on tablet</div>
 * <div *appShowOn="'desktop'">Only visible on desktop</div>
 * ```
 * 
 * The directive uses Angular's effect() to reactively update the view
 * when the viewport changes, ensuring the content is shown or hidden
 * based on the current breakpoint.
 */
@Directive({
  selector: '[appShowOn]',
  standalone: true
})
export class ShowOnDirective {
  @Input() appShowOn!: Breakpoint;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private responsive: ResponsiveService
  ) {
    // Use effect() to reactively update view based on viewport changes
    // effect() must be called in constructor (injection context)
    effect(() => {
      const shouldShow = this.responsive.matchesBreakpoint(this.appShowOn);
      
      if (shouldShow) {
        // Create embedded view if it doesn't exist
        if (this.viewContainer.length === 0) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      } else {
        // Clear view if it exists
        this.viewContainer.clear();
      }
    });
  }
}
