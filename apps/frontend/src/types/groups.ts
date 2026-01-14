export type UserGroupMember = {
  id: string;
  groupId: string;
  userId: string;
  createdAt: string;
};

export type UserGroup = {
  id: string;
  name: string;
  description?: string | null;
  membersCount?: number;
  createdAt: string;
  updatedAt: string;
};
