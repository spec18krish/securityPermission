import { SecurityPermissionName } from './security-permission-name';
import { permissions } from './permissions';
import { Component, OnInit } from '@angular/core';
import { SecurityNode } from './security-node';

@Component({
  selector: 'app-security-node',
  templateUrl: './security-node.component.html',
  styleUrls: ['./security-node.component.scss']
})
export class SecurityNodeComponent implements OnInit {

  permissions = permissions;
  securityPermissionName = SecurityPermissionName;

  allPermissionHeader: boolean = false;
  readPermissionHeader: boolean = false;
  updatePermissionHeader: boolean = false;
  createPermissionHeader: boolean = false;
  deletePermissionHeader: boolean = false;

  permissionHeader: SecurityNode = new SecurityNode();


  constructor() {
    //this.permissionHeader.canCreate = true;
   }

  ngOnInit(): void {
  }

  startUpdate(data: SecurityNode, permissionName: SecurityPermissionName, valueToSet: boolean) {
    this.updateChildrenAndGrantChildrenPermission(data, permissionName, valueToSet);
    this.updateParentAndGrantParentPermission(data, permissionName, valueToSet);
  }

  onPermissionHeaderClick(permissionName: SecurityPermissionName, eventArgs?: any) {
    const valueToSet = this.permissionHeader[permissionName] = !this.permissionHeader[permissionName] as boolean;
    this.permissions.forEach((node) => {
      this.setPermission(node, permissionName, valueToSet);
    });
  }

  onPermissionNodeClick(data: SecurityNode, permissionName: SecurityPermissionName) {
   const valueToSet = !data[permissionName];
   this.setPermission(data, permissionName, valueToSet);
  }

  setPermission(data: SecurityNode, permissionName: SecurityPermissionName, valueToSet: boolean) {
    data[permissionName] = valueToSet;
    if (permissionName === this.securityPermissionName.All) {
      this.startUpdate(data, SecurityPermissionName.Create, valueToSet);
      this.startUpdate(data, SecurityPermissionName.Edit, valueToSet);
      this.startUpdate(data, SecurityPermissionName.Read, valueToSet);
      this.startUpdate(data, SecurityPermissionName.Delete, valueToSet);
    }
    else {
      this.startUpdate(data, permissionName, valueToSet)
    }
  }

  getParents = (data: SecurityNode) => {
   return this.permissions.filter(f => data.parentId && f.id === data.parentId);
  }

  getChildrens = (data: SecurityNode) => {
    return this.permissions.filter(f => f.parentId && f.parentId === data.id);
  }

  setParentPermission(data: SecurityNode, permissionName: SecurityPermissionName, valueToSet: boolean) {
    let currentValue = undefined;
    const childrens = this.getChildrens(data);
    const hasAllChildPermission = childrens.every(e => e[permissionName]);
    const hasAnyChildPermission = childrens.some(s => s[permissionName]);
    const hasAnyUndefined = childrens.some(s => s[permissionName] === undefined);

    if (hasAllChildPermission) currentValue = hasAllChildPermission;
    if (!hasAnyChildPermission) currentValue = false;
    if (hasAnyUndefined) currentValue = undefined;

    data[permissionName] = currentValue;
  }

  updateChildrenAndGrantChildrenPermission(data: SecurityNode, permissionName: SecurityPermissionName, valueToSet: boolean) {
    let hasChildren = permissions.some(f => f.parentId && f.parentId === data.id);
    if (hasChildren) {
      let childrens = permissions.filter(f => f.parentId && f.parentId === data.id);
      childrens.forEach(node => {
        node[permissionName] = valueToSet;
        this.updateChildrenAndGrantChildrenPermission(node, permissionName, valueToSet);
      })
    }
    else {
      data[permissionName] = valueToSet;
      return;
    }
  }

  updateParentAndGrantParentPermission(data: SecurityNode, permissionName: SecurityPermissionName, valueToSet: boolean) {
    let hasParent = permissions.some(f => f.id === data.parentId && data.parentId);
    if (hasParent) {
      let parents = permissions.filter(f => f.id === data.parentId && data.parentId);
      parents.forEach(node => {
        this.setParentPermission(node, permissionName, valueToSet);
        this.updateParentAndGrantParentPermission(node, permissionName, valueToSet);
      })
    }
  }

}
