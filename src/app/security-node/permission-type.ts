export enum PermissionType {
  NoAccess = 0,
  Create = 1 << 0,
  Edit = 1 << 1,
  Read = 1 << 2,
  Delete = 1 << 3,
  FullAcess =  PermissionType.Create | PermissionType.Edit | PermissionType.Read | PermissionType.Delete,
}
