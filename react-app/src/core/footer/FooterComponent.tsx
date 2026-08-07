import { scope } from '../../shared/scope';
import './footer.component.scss';

const ng = scope('footer');

export function FooterComponent() {
    return (
        <app-footer {...ng}>
            <div {...ng} id="footer">
                <p {...ng}>
                    {'Show this project some \u2764 on '}
                    <a {...ng} href="https://github.com/hdjirdeh/angular2-hn" target="_blank" rel="noopener">
                        GitHub
                    </a>
                </p>
            </div>
        </app-footer>
    );
}
