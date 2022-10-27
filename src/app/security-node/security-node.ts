export class SecurityNode {

  private _canRead: boolean | undefined = false;
  private _canUpdate: boolean | undefined = false;
  private _canDelete: boolean | undefined = false;
  private _canCreate: boolean | undefined = false;
  private _allPermission: boolean | undefined = false;
  private _needUpdate: boolean = true;

  public permissionName: string = '';
  public id!: number | undefined;
  public parentId!:number | undefined;

  constructor(id?: number, name?: string, parentId?: number) {
    this.id = id;
    this.permissionName = name || '';
    this.parentId = parentId;
  }

  public setFullPermission(value: boolean | undefined) {
    let hasAllPermission = this.canRead && this.canDelete && this.canUpdate && this.canCreate;
    if (value !== undefined) {
      this._needUpdate = false;
      this.canCreate = this.canUpdate = this.canRead = this.canDelete = value;
      this._needUpdate = true;
    }
  }

  public updatePermission(value: boolean | undefined) {
    if (!this._needUpdate) {
      return
    }

    let hasAllPermission = this.canRead && this.canDelete && this.canUpdate && this.canCreate;
    let hasNoPermission =  !this.canRead && !this.canDelete && !this.canUpdate && !this.canCreate;
    let hasAnyUndefined = this.canRead === undefined || this.canDelete === undefined || this.canUpdate === undefined || this.canCreate === undefined;
    if (hasNoPermission && !hasAnyUndefined) {
      this.allPermission = false;
      return;
    }

    if (hasAnyUndefined) {
      this.allPermission = undefined;
    }
    this.allPermission = hasAllPermission || undefined;
  }

  public get allPermission() {
    return this._allPermission;
  }

  public set allPermission(value: boolean | undefined) {
    this._allPermission = value;
    this.setFullPermission(this._allPermission);
  }

  public get canRead() {
    return this._canRead;
  }

  public set canRead(value: boolean | undefined) {
    this._canRead = value;
    this.updatePermission(value);
  }

  public get canUpdate() {
    return this._canUpdate;
  }

  public set canUpdate(value: boolean | undefined) {
    this._canUpdate = value;
    this.updatePermission(value);
  }

  public get canDelete() {
    return this._canDelete;
  }

  public set canDelete(value: boolean | undefined) {
    this._canDelete = value;
    this.updatePermission(value);
  }

  public get canCreate() {
    return this._canCreate;
  }

  public set canCreate(value: boolean | undefined) {
    this._canCreate = value;
    this.updatePermission(value);
  }

}
