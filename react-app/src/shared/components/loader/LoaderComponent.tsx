import { scope } from '../../scope';
import './loader.component.scss';

const ng = scope('loader');

export function LoaderComponent() {
    return (
        <app-loader {...ng}>
            <div {...ng} className="loading-section">
                <div {...ng} className="loader">
                    Loading...
                </div>
            </div>
        </app-loader>
    );
}
