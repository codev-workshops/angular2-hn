import DOMPurify from 'dompurify';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../api/hackernews';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import './UserPage.scss';

export function UserPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isPending, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  });

  if (isPending) return <Loader />;
  if (isError) return <ErrorMessage message={'Could not load user ' + id + '.'} />;

  return (
    <div className="profile">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={() => navigate(-1)}></span>
          Profile: {user.id}
        </p>
      </div>
      <div className="main-details">
        <span className="name">{user.id}</span>
        <span className="right">{user.karma} ★</span>
        <p className="age">Created {user.created}</p>
      </div>
      {user.about && (
        <div className="other-details">
          <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(user.about) }} />
        </div>
      )}
    </div>
  );
}
