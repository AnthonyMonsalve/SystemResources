export type CommentAuthor = {
  id: string;
  name?: string;
  email: string;
};

export type Comment = {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: CommentAuthor;
  createdAt: string;
  updatedAt: string;
};

export type CommentsResponse = {
  items: Comment[];
  total: number;
  page: number;
  limit: number;
};
