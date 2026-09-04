import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxTimeSpinnerColumnComponent } from './time-spinner-column.component';

function keyEvent(key: string): KeyboardEvent {
  return { key, preventDefault: () => {} } as KeyboardEvent;
}

describe('NgxTimeSpinnerColumnComponent', () => {
  let fixture: ComponentFixture<NgxTimeSpinnerColumnComponent>;
  let component: NgxTimeSpinnerColumnComponent;
  let emitted: number | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NgxTimeSpinnerColumnComponent] });
    fixture = TestBed.createComponent(NgxTimeSpinnerColumnComponent);
    component = fixture.componentInstance;
    component.min = 0;
    component.max = 23;
    emitted = undefined;
    component.valueChange.subscribe((v) => (emitted = v));
    fixture.detectChanges();
  });

  it('wraps 23 -> 0 on ArrowUp (hour dial)', () => {
    component.value = 23;
    component['onKeydown'](keyEvent('ArrowUp'));
    expect(emitted).toBe(0);
  });

  it('wraps 0 -> 23 on ArrowDown (hour dial)', () => {
    component.value = 0;
    component['onKeydown'](keyEvent('ArrowDown'));
    expect(emitted).toBe(23);
  });

  it('wraps a 0-59 dial the same way', () => {
    component.min = 0;
    component.max = 59;
    component.value = 59;
    component['onKeydown'](keyEvent('ArrowUp'));
    expect(emitted).toBe(0);
  });

  it('Home jumps to min, End jumps to max', () => {
    component.value = 10;
    component['onKeydown'](keyEvent('Home'));
    expect(emitted).toBe(0);

    emitted = undefined;
    component.value = 10;
    component['onKeydown'](keyEvent('End'));
    expect(emitted).toBe(23);
  });

  it('does not emit when disabled', () => {
    component.disabled = true;
    component.value = 5;
    component['onKeydown'](keyEvent('ArrowUp'));
    expect(emitted).toBeUndefined();
  });
});
