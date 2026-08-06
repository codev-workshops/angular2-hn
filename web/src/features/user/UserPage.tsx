import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import { fetchUser } from '../../lib/api';
import { sanitizeHtml } from '../../lib/html';
import { User } from '../../types/models';

export function UserPage() {
    const { id: userID } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<unknown>();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let active = true;
        setUser(undefined);
        setErrorMessage('');

        fetchUser(userID ?? '').then(
            (response) => {
                if (active) {
                    setUser(response);
                }
            },
            () => {
                if (active) {
                    setErrorMessage(`Could not load user ${userID}.`);
                }
            }
        );

        return () => {
            active = false;
        };
    }, [userID]);

    if (!user && errorMessage === '') {
        return <Loader />;
    }

    if (!user && errorMessage !== '') {
        return <ErrorMessage message={errorMessage} />;
    }

    const profile: User = typeof user === 'object' && user !== null ? (user as User) : {};
    const about = typeof profile.about === 'string' ? profile.about : '';

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span className="back-button" onClick={() => navigate(-1)} />
                    Profile: {profile.id}
                </p>
            </div>
            <div className="main-details">
                <span className="name">{profile.id}</span>
                <span className="right">{profile.karma} ★</span>
                <p className="age">Created {profile.created}</p>
            </div>
            {about ? (
                <div className="other-details">
                    <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(about) }} />
                </div>
            ) : null}
        </div>
    );
}
