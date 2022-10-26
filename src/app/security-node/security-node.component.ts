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
    this.updateChildrenAndGrantChildrenPermission(data, permissionName, valueToSet);
    this.updateParentAndGrantParentPermission(data, permissionName, valueToSet);
  }

  setParentPermission(data: SecurityNode, permissionName: SecurityPermissionName, valueToSet: boolean) {
    const hasAllChildPermission = this.permissions.every(e => e[permissionName]);
    const hasNoChildPermission = this.permissions.some(s => s[permissionName]);

    data[permissionName] = hasAllChildPermission || !hasNoChildPermission || undefined;
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
    data[permissionName] = valueToSet;
    let hasParent = permissions.some(f => f.id === data.parentId && data.parentId);
    if (hasParent) {
      let parents = permissions.filter(f => f.id === data.parentId && data.parentId);
      parents.forEach(node => {
       this.setParentPermission(data, permissionName, valueToSet);
        this.updateParentAndGrantParentPermission(node, permissionName, valueToSet);
      })
    }
    else {
      this.setParentPermission(data, permissionName, valueToSet);
      return;
    }
  }

}
