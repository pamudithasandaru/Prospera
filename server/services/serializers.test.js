const test = require('node:test');
const assert = require('node:assert/strict');
const { serializePost } = require('./serializers');

test('serializes persistent reactions, shares, and nested replies', () => {
  const post = serializePost({
    id: 'post-1',
    text: 'Harvest update',
    images: [],
    type: 'post',
    category: 'general',
    visibility: 'public',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    author: { id: 'user-1', name: 'Farmer', role: 'farmer', avatar: '' },
    likes: [],
    reactions: [{ userId: 'user-2', type: 'celebrate', createdAt: new Date('2026-01-01T01:00:00Z') }],
    shares: [],
    _count: { shares: 3, comments: 1 },
    comments: [{
      id: 'comment-1',
      authorId: 'user-2',
      author: { id: 'user-2', name: 'Expert', avatar: '' },
      text: 'Well done',
      parentId: null,
      createdAt: new Date('2026-01-01T02:00:00Z'),
      replies: [{
        id: 'reply-1',
        authorId: 'user-1',
        author: { id: 'user-1', name: 'Farmer', avatar: '' },
        text: 'Thank you',
        parentId: 'comment-1',
        createdAt: new Date('2026-01-01T03:00:00Z'),
      }],
    }],
  });

  assert.equal(post.reactions[0].type, 'celebrate');
  assert.equal(post.likes[0].user, 'user-2');
  assert.equal(post.shares, 3);
  assert.equal(post.comments[0].replies[0].parentId, 'comment-1');
});
