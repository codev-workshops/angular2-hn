import type { DetailedHTMLProps, HTMLAttributes } from 'react';

/**
 * The Angular app renders a real DOM element for every component host
 * (`<app-header>`, `<item>`, …) plus an empty `<router-outlet>`. Those elements
 * participate in layout and are styled from the outside (`item.item-block`), so
 * the React port renders them too.
 */
type Host = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'app-header': Host;
            'app-footer': Host;
            'app-settings': Host;
            'app-loader': Host;
            'app-error-message': Host;
            'app-feed': Host;
            'app-item-details': Host;
            'app-comment': Host;
            'app-user': Host;
            'router-outlet': Host;
            item: Host;
        }
    }
}
