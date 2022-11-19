import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  constructor() { }

  public contactUsForm!: FormGroup;
  public formControls: any;
  public formControlsName: any;

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {

    this.formControlsName = {
      name: 'name',
      email: 'email',
      description: 'description',
      reasonFA: 'reasonFA',
    }

    this.contactUsForm = new FormGroup({
      [this.formControlsName.name]: new FormControl(),
      [this.formControlsName.email]: new FormControl(),
      [this.formControlsName.description]: new FormControl(),
      [this.formControlsName.reasonFA]: new FormArray([])
    });


    this.formControls = {
      [this.formControlsName.name]: this.contactUsForm.get('name'),
      [this.formControlsName.email]: this.contactUsForm.get('email'),
      [this.formControlsName.description]: this.contactUsForm.get('description'),
      [this.formControlsName.reasonFA]: this.contactUsForm.get('reasonFA') as FormArray,
    };

  }

  onFormSubmit(formParams: any) {
    console.log(formParams);
    console.log(this.formControls);
  }

  addReason() {
    let reasonGp = new FormGroup({
      reason: new FormControl()
    })
    this.formControls.reasonFA.push(reasonGp);
  }

}
