import { render, screen } from '@testing-library/react';
import CommentSection from './CommentSection';

test('renders persisted nested comment replies', () => {
  render(
    <CommentSection
      post={{
        _id: 'post-1',
        comments: [{
          _id: 'comment-1',
          user: { _id: 'user-1', name: 'Farmer' },
          text: 'Original comment',
          replies: [{
            _id: 'reply-1',
            user: { _id: 'user-2', name: 'Expert' },
            text: 'Helpful reply',
          }],
        }],
      }}
      user={{ _id: 'user-3', name: 'Viewer' }}
      isExpanded
      commentText=""
      onCommentChange={() => {}}
      onAddComment={() => {}}
    />,
  );

  expect(screen.getByText('Original comment')).toBeInTheDocument();
  expect(screen.getByText('Helpful reply')).toBeInTheDocument();
});
