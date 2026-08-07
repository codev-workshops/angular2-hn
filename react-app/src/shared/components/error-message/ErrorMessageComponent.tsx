import { scope } from '../../scope';
import './error-message.component.scss';

const ng = scope('error-message');

export function ErrorMessageComponent({ message }: { message: string }) {
    return (
        <app-error-message {...ng}>
            <div {...ng} className="error-section">
                <div {...ng} className="skull">
                    <div {...ng} className="head">
                        <div {...ng} className="crack"></div>
                    </div>
                    <div {...ng} className="mouth">
                        <div {...ng} className="teeth"></div>
                    </div>
                </div>
                <p {...ng} className="strong">
                    {message}
                </p>
                <p {...ng}>
                    If you are offline viewing, you&#39;ll need to visit this page with a network connection first
                    before it can work offline.
                </p>
            </div>
        </app-error-message>
    );
}
