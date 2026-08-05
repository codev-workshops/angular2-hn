import { useQuery } from '@tanstack/react-query';
import { fetchFeed } from '../api/hackernews';
import { Item } from '../components/Item';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';

// TEMPORARY reference harness — removed in the final routing wave.
export function ItemHarness() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['feed', 'news', 1],
    queryFn: () => fetchFeed('news', 1),
  });

  if (isPending) return <Loader />;
  if (isError) return <ErrorMessage message="Could not load news stories." />;

  return (
    <div className="main-content">
      <ol start={1}>
        {data.slice(0, 3).map((story) => (
          <li key={story.id} className="post">
            <Item item={story} />
          </li>
        ))}
      </ol>
    </div>
  );
}
