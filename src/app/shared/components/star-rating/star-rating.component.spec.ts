import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let fixture: ComponentFixture<StarRatingComponent>;
  let component: StarRatingComponent;

  const buttons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('button'));

  const render = (rating: number, readonly = false) => {
    fixture = TestBed.createComponent(StarRatingComponent);
    component = fixture.componentInstance;
    component.rating = rating;
    component.readonly = readonly;
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [StarRatingComponent] });
  });

  it('renders filled and empty stars for the rating', () => {
    render(3);

    expect(buttons().map(b => b.textContent.trim()).join('')).toBe('★★★☆☆');
    expect(buttons().map(b => b.getAttribute('aria-label'))).toEqual([
      'Rate 1 star', 'Rate 2 stars', 'Rate 3 stars', 'Rate 4 stars', 'Rate 5 stars',
    ]);
    expect(fixture.nativeElement.querySelector('[role="radiogroup"]').getAttribute('aria-label')).toBe('Your rating');
  });

  it('emits the clicked star', () => {
    render(0);
    const emitted: number[] = [];
    component.ratingChange.subscribe(v => emitted.push(v));

    buttons()[3].click();

    expect(emitted).toEqual([4]);
  });

  it('emits 0 when the current rating is clicked', () => {
    render(2);
    const emitted: number[] = [];
    component.ratingChange.subscribe(v => emitted.push(v));

    buttons()[1].click();

    expect(emitted).toEqual([0]);
  });

  it('does not emit when readonly', () => {
    render(2, true);
    const emitted: number[] = [];
    component.ratingChange.subscribe(v => emitted.push(v));

    buttons()[4].click();

    expect(emitted).toEqual([]);
    expect(buttons().every(b => b.disabled)).toBe(true);
  });
});
