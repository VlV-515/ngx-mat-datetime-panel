import { Overlay, OverlayConfig, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ESCAPE } from '@angular/cdk/keycodes';
import { ViewContainerRef, inject } from '@angular/core';
import { Subject, Subscription, merge } from 'rxjs';
import { filter, take } from 'rxjs/operators';

export interface NgxDatetimePanelOverlayConfig {
  panelClass?: string | string[];
  restoreFocus: boolean;
}

/**
 * Shared CDK Overlay orchestration for both the single-value and range datetime panels:
 * position relative to the triggering input, backdrop click / Escape / outside-scroll close,
 * and focus restoration. Subclasses (the two panel components) supply the `TemplatePortal`
 * content and their own public `open()`/`close()` + `opened`/`closed` outputs.
 */
export abstract class NgxDatetimePanelBase {
  protected readonly overlay = inject(Overlay);
  protected readonly viewContainerRef = inject(ViewContainerRef);

  protected overlayRef: OverlayRef | null = null;

  private closeSubscription = Subscription.EMPTY;
  private focusedElementBeforeOpen: HTMLElement | null = null;
  private restoringFocus = false;

  /** Emits whenever the overlay is closed, regardless of cause (Escape, backdrop, or programmatic `close()`). */
  protected readonly panelClosed = new Subject<void>();

  get isOpen(): boolean {
    return this.overlayRef?.hasAttached() ?? false;
  }

  /**
   * True only for the duration of the synchronous `.focus()` call that `closeOverlay()` makes
   * to restore focus to the triggering input. Lets the input directive's `openOnFocus` handler
   * tell that restore apart from a real user focus and skip immediately reopening the panel.
   */
  get isRestoringFocus(): boolean {
    return this.restoringFocus;
  }

  protected openOverlay(origin: HTMLElement, portal: TemplatePortal, config: NgxDatetimePanelOverlayConfig): void {
    if (this.isOpen) {
      return;
    }

    this.focusedElementBeforeOpen = config.restoreFocus ? (document.activeElement as HTMLElement | null) : null;

    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create(this.buildOverlayConfig(origin, config));
    } else {
      this.overlayRef.updatePositionStrategy(this.buildPositionStrategy(origin));
    }

    this.overlayRef.attach(portal);
    this.subscribeToCloseTriggers();
  }

  protected closeOverlay(): void {
    if (!this.isOpen) {
      return;
    }

    this.overlayRef?.detach();
    this.closeSubscription.unsubscribe();

    if (this.focusedElementBeforeOpen) {
      this.restoringFocus = true;
      this.focusedElementBeforeOpen.focus();
      this.restoringFocus = false;
      this.focusedElementBeforeOpen = null;
    }

    this.panelClosed.next();
  }

  protected destroyOverlay(): void {
    this.closeSubscription.unsubscribe();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  private subscribeToCloseTriggers(): void {
    if (!this.overlayRef) {
      return;
    }

    const escapeKeydown$ = this.overlayRef.keydownEvents().pipe(filter((event) => event.keyCode === ESCAPE));

    this.closeSubscription.unsubscribe();
    this.closeSubscription = merge(this.overlayRef.backdropClick(), escapeKeydown$, this.overlayRef.detachments())
      .pipe(take(1))
      .subscribe(() => this.closeOverlay());
  }

  private buildOverlayConfig(origin: HTMLElement, config: NgxDatetimePanelOverlayConfig): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this.buildPositionStrategy(origin),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: config.panelClass,
    });
  }

  private buildPositionStrategy(origin: HTMLElement): PositionStrategy {
    return this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withFlexibleDimensions(true)
      .withViewportMargin(8)
      .withPush(true)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
      ]);
  }
}
