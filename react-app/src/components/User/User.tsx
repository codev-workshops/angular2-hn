import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackerNews';
import type { User as UserModel } from '../../models/user';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { Loader } from '../Loader/Loader';

import './User.scss';

export default function User() {
    const params = useParams();
    const navigate = useNavigate();
    const userID = params.id as string;

    const [user, setUser] = useState<UserModel | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        fetchUser(userID, controller.signal)
            .then((data) => setUser(data))
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage('Could not load user ' + userID + '.');
            });

        return () => controller.abort();
    }, [userID]);

    return (
        <div className="c-user">
            {!user && !errorMessage ? <Loader /> : null}
            {!user && errorMessage !== '' ? <ErrorMessage message={errorMessage} /> : null}

            {user ? (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {` Profile: ${user.id} `}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span>
                        <span className="right">{`${user.karma} ★`}</span>
                        <p className="age">{`Created ${user.created}`}</p>
                    </div>
                    {user.about ? (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }}></p>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
