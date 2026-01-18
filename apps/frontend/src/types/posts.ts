export type PostVisibility = "PUBLIC" | "USER" | "GROUP";

export type PostUser = {
  id: string;
  name?: string;
  email: string;
};

export type PostGroup = {
  id: string;
  name: string;
};

export type PostMedia = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  url: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
};

export type Post = {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  category?: string | null;
  tags: string[];
  visibility: PostVisibility;
  ownerUserId?: string | null;
  groupId?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerUser?: PostUser | null;
  group?: PostGroup | null;
  mediaFiles?: PostMedia[];
};
