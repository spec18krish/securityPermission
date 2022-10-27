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

  constructor() { }

  ngOnInit(): void {
  }

  onPermissionNodeClick(data: SecurityNode, permissionName: SecurityPermissionName) {
    const valueToSet = !data[permissionName];
    data[permissionName] = valueToSet;
    this.updateChildrenAndGrantChildrenPermission(data, permissionName, valueToSet);
    this.updateParentAndGrantParentPermission(data, permissionName, valueToSet);
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

    if (hasAllChildPermission) currentValue = hasAllChildPermission;
    if (!hasAnyChildPermission) currentValue = false;

    data[permissionName] = currentValue;
  }

  setChildPermission(data: SecurityNode, permissionName: SecurityPermissionName, valueToSet: boolean) {
    const hasAllChildPermission = this.permissions.every(e => e[permissionName]);
    const hasNoChildPermission = this.permissions.some(s => s[permissionName]);

    data[permissionName] = hasAllChildPermission || !hasNoChildPermission || undefined;
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
