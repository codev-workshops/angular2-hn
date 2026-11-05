import { Comment } from './comment';
import { PollResult } from './poll-result';
import { Story } from './story';
import { User } from './user';

describe('models', () => {
  it('Story should hold nested comments and poll results', () => {
    const reply = Object.assign(new Comment(), { id: 2, level: 1, comments: [] });
    const comment = Object.assign(new Comment(), { id: 1, level: 0, deleted: false, comments: [reply] });
    const poll = Object.assign(new PollResult(), { points: 5, content: 'yes' });
    const story = Object.assign(new Story(), { id: 1, type: 'poll', comments: [comment], poll: [poll] });

    expect(story instanceof Story).toBe(true);
    expect(story.comments[0].comments[0]).toBe(reply);
    expect(story.poll[0].points).toBe(5);
  });

  it('should start with undefined fields', () => {
    expect(new Story().id).toBeUndefined();
    expect(new Comment().comments).toBeUndefined();
    expect(new PollResult().points).toBeUndefined();
    expect(new User().karma).toBeUndefined();
  });
});
