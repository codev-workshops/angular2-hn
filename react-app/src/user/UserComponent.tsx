import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { fetchUser } from '../shared/api/hackernews-api';
import { ErrorMessageComponent } from '../shared/components/error-message/ErrorMessageComponent';
import { LoaderComponent } from '../shared/components/loader/LoaderComponent';
import type { User } from '../shared/models/user';
import { scope } from '../shared/scope';
import './user.component.scss';

const ng = scope('user');

export function UserComponent() {
    const { id } = useParams();
    const userID = id ?? '';
    const navigate = useNavigate();
    const [user, setUser] = useState<User | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');
    const latestRequest = useRef(0);

    useEffect(() => {
        const controller = new AbortController();
        const request = ++latestRequest.current;
        fetchUser(userID, controller.signal).then(
            (fetched) => {
                if (request === latestRequest.current) {
                    setUser(fetched);
                }
            },
            () => {
                if (request === latestRequest.current) {
                    setErrorMessage(`Could not load user ${userID}.`);
                }
            }
        );
        return () => controller.abort();
    }, [userID]);

    return (
        <app-user>
            {!user && errorMessage === '' ? <LoaderComponent /> : null}
            {!user && errorMessage !== '' ? <ErrorMessageComponent message={errorMessage} /> : null}

            {user ? (
                <div {...ng} className="profile">
                    <div {...ng} className="mobile item-header">
                        <p {...ng} className="title-block">
                            <span {...ng} className="back-button" onClick={() => navigate(-1)}></span>
                            {` Profile: ${user.id} `}
                        </p>
                    </div>
                    <div {...ng} className="main-details">
                        <span {...ng} className="name">
                            {user.id}
                        </span>
                        <span {...ng} className="right">
                            {`${user.karma} \u2605`}
                        </span>
                        <p {...ng} className="age">
                            {`Created ${user.created}`}
                        </p>
                    </div>
                    {user.about ? (
                        <div {...ng} className="other-details">
                            <p {...ng} dangerouslySetInnerHTML={{ __html: user.about }}></p>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </app-user>
    );
}
