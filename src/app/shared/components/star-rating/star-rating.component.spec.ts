import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedComponentsModule } from '../shared-components.module';
import { RatingsService } from '../../services/ratings.service';
import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let fixture: ComponentFixture<StarRatingComponent>;
  let service: RatingsService;
  const buttons = () => fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
  const filled = () => fixture.nativeElement.querySelectorAll('.filled').length;

  beforeEach(() => {
    localStorage.removeItem('itemRatings');
    TestBed.configureTestingModule({ imports: [SharedComponentsModule] });
    service = TestBed.inject(RatingsService);
    fixture = TestBed.createComponent(StarRatingComponent);
    fixture.componentInstance.itemId = 42;
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem('itemRatings'));

  it('renders five accessible native buttons and the saved rating', () => {
    service.setRating(42, 2);
    fixture.detectChanges();
    expect(buttons().length).toBe(5);
    expect(buttons()[1].getAttribute('aria-label')).toContain('2 out of 5');
    expect(buttons()[1].getAttribute('aria-pressed')).toBe('true');
    expect(buttons()[0].type).toBe('button');
    expect(filled()).toBe(2);
  });

  it('sets and clears ratings without bubbling or navigating', () => {
    const parentClick = jasmine.createSpy('parentClick');
    fixture.nativeElement.addEventListener('click', parentClick);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    buttons()[2].dispatchEvent(event);
    fixture.detectChanges();
    expect(service.getRating(42)).toBe(3);
    expect(filled()).toBe(3);
    expect(event.defaultPrevented).toBe(true);
    expect(parentClick).not.toHaveBeenCalled();
    buttons()[2].click();
    fixture.detectChanges();
    expect(service.getRating(42)).toBe(0);
    expect(filled()).toBe(0);
  });

  it('previews hover and keyboard focus without saving', () => {
    service.setRating(42, 1);
    buttons()[3].dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(filled()).toBe(4);
    expect(service.getRating(42)).toBe(1);
    fixture.nativeElement.querySelector('.star-rating').dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(filled()).toBe(1);
    buttons()[2].dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(filled()).toBe(3);
    buttons()[2].dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(filled()).toBe(1);
  });

  it('updates for another item and supports a smaller or empty maximum', () => {
    service.setRating(43, 2);
    fixture.componentInstance.itemId = 43;
    fixture.componentInstance.max = 3;
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
    expect(buttons().length).toBe(3);
    expect(filled()).toBe(2);
    fixture.componentInstance.max = 0;
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
    expect(buttons().length).toBe(0);
  });
});
