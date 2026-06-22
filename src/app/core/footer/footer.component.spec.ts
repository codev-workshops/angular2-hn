import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FooterComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render GitHub link', () => {
        const compiled = fixture.nativeElement;
        const link = compiled.querySelector('a');
        expect(link.getAttribute('href')).toContain('github.com');
        expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should have footer id', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('#footer')).toBeTruthy();
    });
});
