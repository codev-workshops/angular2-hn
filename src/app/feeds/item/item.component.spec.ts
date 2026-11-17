import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { CommentPipe } from '../../shared/pipes/comment.pipe';

describe('ItemComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [CommonModule, RouterTestingModule] }));

  it('renders and responds through its public interface', () => {
    TestBed.configureTestingModule({ declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: { settings: { titleFontSize: '16', listSpacing: '0' } } }] });
    const fixture = TestBed.createComponent(ItemComponent);
    fixture.componentInstance.item = { id: 1, title: 'A story', url: 'https://example.com', type: 'story' } as any;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.title').getAttribute('href')).toBe('https://example.com');
    fixture.componentInstance.item.url = 'item/1';
    fixture.detectChanges();
    expect(fixture.componentInstance.hasUrl).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('A story');
  });
});
