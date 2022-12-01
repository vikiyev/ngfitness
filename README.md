# Ngfitness

This angular app is built following Max Schwarzmuller's course [Angular with Angular Material, Angularfire & NgRx](https://www.udemy.com/course/angular-full-app-with-angular-material-angularfire-ngrx/)

- [Ngfitness](#ngfitness)
  - [Template Driven Forms with Error and Validation](#template-driven-forms-with-error-and-validation)
  - [Datepicker with Age Restriction](#datepicker-with-age-restriction)

## Template Driven Forms with Error and Validation

To register input fields into our template driven form, we can use the **ngModel** directive together with the name property. We need to bind the ngSubmit action and pass into it the form data through ngForm. We can use the **mat-hint** material component to render hints or the hintLabel directive. We can bind the error messages to the **mat-error** material component.

```html
<form
  fxLayout="column"
  fxLayoutAlign="center center"
  #f="ngForm"
  (ngSubmit)="onSubmit(f)"
>
  <mat-form-field>
    <input
      type="email"
      matInput
      placeholder="Your email"
      ngModel
      name="email"
      required
      email
      #emailInput="ngModel"
    />
    <mat-error *ngIf="emailInput.hasError('required')"
      >Field is required</mat-error
    >
    <mat-error *ngIf="!emailInput.hasError('required')"
      >Email is invalid</mat-error
    >
  </mat-form-field>
  <mat-form-field hintLabel="Should be at least 6 characters long.">
    <input
      type="password"
      matInput
      placeholder="Your password"
      ngModel
      name="password"
      required
      minlength="6"
      #pwInput="ngModel"
    />
    <mat-hint align="end">{{ pwInput.value?.length }} / 6</mat-hint>
    <mat-error>Has to be at least 6 characters</mat-error>
  </mat-form-field>

  <button type="submit" mat-raised-button color="primary">Submit</button>
</form>
```

## Datepicker with Age Restriction

For setting an age restriction, we can bind the max property of the input field into our typescript class.

```html
<mat-form-field>
  <input
    matInput
    placeholder="Your Birthdate"
    [matDatepicker]="picker"
    [max]="maxDate"
    ngModel
    name="birthdate"
    required
  />
  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
</mat-form-field>
```

```typescript
export class SignupComponent implements OnInit {
  maxDate: Date = new Date();

  ngOnInit(): void {
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }
}
```
