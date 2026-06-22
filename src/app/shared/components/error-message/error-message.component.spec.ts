import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
    let component: ErrorMessageComponent;
    let fixture: ComponentFixture<ErrorMessageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ErrorMessageComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorMessageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should display the provided error message', () => {
        component.message = 'Something went wrong';
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.strong').textContent).toContain('Something went wrong');
    });

    it('should display offline help text', () => {
        component.message = 'Error';
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.textContent).toContain('offline');
    });
});
