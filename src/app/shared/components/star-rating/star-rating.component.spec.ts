import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RATINGS_STORAGE_KEY, RatingService } from '../../services/rating.service';
import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let fixture: ComponentFixture<StarRatingComponent>;
  let ratingService: RatingService;

  const buttons = (): HTMLButtonElement[] => Array.from(fixture.nativeElement.querySelectorAll('button'));
  const glyphs = (): string => buttons().map(b => b.textContent.trim()).join('');

  beforeEach(() => {
    localStorage.removeItem(RATINGS_STORAGE_KEY);
    TestBed.configureTestingModule({ declarations: [StarRatingComponent] });
    ratingService = TestBed.inject(RatingService);
  });

  afterEach(() => localStorage.removeItem(RATINGS_STORAGE_KEY));

  function create(itemId: number): void {
    fixture = TestBed.createComponent(StarRatingComponent);
    fixture.componentInstance.itemId = itemId;
    fixture.detectChanges();
  }

  it('renders five labelled star buttons', () => {
    create(1);

    expect(buttons().length).toBe(5);
    expect(buttons()[0].getAttribute('aria-label')).toBe('Rate 1 star');
    expect(buttons()[4].getAttribute('aria-label')).toBe('Rate 5 stars');
    expect(glyphs()).toBe('☆☆☆☆☆');
  });

  it('loads the stored rating on init', () => {
    ratingService.setRating(1, 3);
    create(1);

    expect(glyphs()).toBe('★★★☆☆');
  });

  it('rates on click and toggles off when the selected star is clicked again', () => {
    create(1);

    buttons()[3].click();
    fixture.nativeElement.querySelector('.star-rating').dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(ratingService.getRating(1)).toBe(4);
    expect(glyphs()).toBe('★★★★☆');

    buttons()[3].click();
    fixture.detectChanges();
    expect(ratingService.getRating(1)).toBe(0);
    expect(glyphs()).toBe('☆☆☆☆☆');
  });
});
