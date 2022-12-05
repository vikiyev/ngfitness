# Ngfitness

This angular app is built following Max Schwarzmuller's course [Angular with Angular Material, Angularfire & NgRx](https://www.udemy.com/course/angular-full-app-with-angular-material-angularfire-ngrx/)

- [Ngfitness](#ngfitness)
  - [Template Driven Forms with Error and Validation](#template-driven-forms-with-error-and-validation)
  - [Datepicker with Age Restriction](#datepicker-with-age-restriction)
  - [Sidebar](#sidebar)
  - [Timer and Dialog](#timer-and-dialog)
  - [Authentication](#authentication)
  - [Route Guard](#route-guard)
  - [Storing Exercise Data](#storing-exercise-data)

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

## Sidebar

Every page in the app will have the sidenav available, so we render the router outlet as a child of mat-sidenav-content. To make the sidenav element available to other components, we can emit a custom event, to which the app component will listen to and use to toggle sidenav.

```html
<!-- app.component -->
<mat-sidenav-container>
  <mat-sidenav #sidenav role="navigation">
    <app-sidenav-list></app-sidenav-list>
  </mat-sidenav>
  <mat-sidenav-content>
    <app-header (sidenavToggle)="sidenav.toggle()"></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
  </mat-sidenav-content>
</mat-sidenav-container>
```

```html
<!-- header.component -->
<mat-toolbar color="primary">
  <!-- hamburger -->
  <div>
    <button mat-icon-button (click)="onToggleSidenav()" fxHide.gt-xs>
      <mat-icon>menu</mat-icon>
    </button>
  </div>
</mat-toolbar>
```

```typescript
export class HeaderComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();

  onToggleSidenav() {
    this.sidenavToggle.emit();
  }
}
```

## Timer and Dialog

The timer uses and stores intervals for keeping track of the time. The **MatDialog** is invoked programmatically as opposed to other components, which are added via the template. We need to include this component in the app module's entryComponents declaration, which are components that are never instantiated by the selectors or by routing. Angular has no way of finding out when this component is going to be used.

```typescript
export class CurrentTrainingComponent implements OnInit {
  progress = 0;
  timer: any;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.startOrResumeTimer();
  }

  startOrResumeTimer() {
    this.timer = setInterval(() => {
      this.progress = this.progress + 5;
      if (this.progress >= 100) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  onStop() {
    clearInterval(this.timer);
    const dialogRef = this.dialog.open(StopTrainingComponent, {
      data: {
        progress: this.progress,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result); // true or false
    });
  }
}
```

```typescript
entryComponents: [StopTrainingComponent],
```

To pass data to the dialog, we set up a **data** object as the second argument to the MatDialog.open method. We then need to inject **MAT_DIALOG_DATA** into the dialog class constructor with **@Inject()**.

```typescript
@Component({
  selector: "app-stop-training",
  templateUrl: "./stop-training.component.html",
})
export class StopTrainingComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}
}
```

```html
<!-- stop-training.component -->
<h1 mat-dialog-title>Are you sure?</h1>
<mat-dialog-content>
  <p>You are already at {{ passedData.progress }} %</p>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="true">Yes</button>
  <button mat-button [mat-dialog-close]="false">No</button>
</mat-dialog-actions>
```

The dialog.open() method returns a reference to the dialog to which we subscribe to. The values returned by this observable are the values bound to [mat-dialog-close]. We can set up an event emitter to emit an event to the parent (training.component) when the dialog returns true (training cancelled).

```typescript
export class CurrentTrainingComponent implements OnInit {
  @Output() trainingExit = new EventEmitter();

  onStop() {
    clearInterval(this.timer);
    const dialogRef = this.dialog.open(StopTrainingComponent, {
      data: {
        progress: this.progress,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result); // true or false
      if (result) {
        // user stops training
        this.trainingExit.emit();
      } else {
        // user doesnt stop training
        this.startOrResumeTimer();
      }
    });
  }
}
```

```html
<!-- training.component -->
<app-current-training
  *ngIf="ongoingTraining"
  (trainingExit)="ongoingTraining = false"
></app-current-training>
```

## Authentication

We create an AuthService for faking a login until we set up Angular Fire. We create a subject which allows us to multicast events and subscribe from other parts of the app. The payload is a boolean which indicates whether a user is signed in or not.

```typescript
export class AuthService {
  public authChange = new Subject<boolean>();
  private user: User;

  registerUser(authData: AuthData) {
    this.user = {
      email: authData.email,
      userId: Math.round(Math.random() * 1000).toString(), // placeholder for until we get angular fire working
    };
    this.authChange.next(true);
  }

  login(authData: AuthData) {
    this.user = {
      email: authData.email,
      userId: Math.round(Math.random() * 1000).toString(), // placeholder for until we get angular fire working
    };
    this.authChange.next(true);
  }

  logout() {
    this.user = null;
    this.authChange.next(false);
  }

  getUser() {
    return { ...this.user };
  }

  isAuth() {
    return this.user != null;
  }
}
```

```typescript
  onSubmit() {
    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    });
  }
```

We listen to changes to the AuthService's authChange property in the header and sidenav component

```typescript
export class HeaderComponent implements OnInit, OnDestroy {
  isAuth: boolean = false;
  authSubscription: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.authChange.subscribe(
      (authStatus) => {
        this.isAuth = authStatus;
      }
    );
  }
}
```

```html
<li *ngIf="!isAuth">
  <a routerLink="/signup">Signup</a>
</li>
<li *ngIf="!isAuth">
  <a routerLink="/login">Login</a>
</li>
<li *ngIf="isAuth">
  <a routerLink="/training">Training</a>
</li>
<li *ngIf="isAuth">
  <a>Logout</a>
</li>
```

## Route Guard

To create route guards, we need to implement the **CanActivate** interface. It needs to return true, a promise that resolves to true, or an observable that resolves to true.

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isAuth()) {
      return true;
    } else {
      this.router.navigate(["/login"]);
      return false;
    }
  }
}
```

To use the guard, we can add it to the app-routing module and provide it there as well

```typescript
const routes: Routes = [
  {
    path: 'training',
    component: TrainingComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  providers: [AuthGuard],
})
```

## Storing Exercise Data

We create a TrainingService for managing the exercises in the app. To set an active exercise, we need to have the training component subscribe when an exercise is selected in the service. We can do so by using a Subject which evaluates to an Exercise.

```typescript
export class TrainingService {
  private availableExercises: Exercise[] = [
    { id: "crunches", name: "Crunches", duration: 30, calories: 8 },
    { id: "touch-toes", name: "Touch Toes", duration: 180, calories: 15 },
    { id: "side-lunges", name: "Side Lunges", duration: 120, calories: 18 },
    { id: "burpees", name: "Burpees", duration: 60, calories: 8 },
  ];
  private exercises: Exercise[] = [];
  private runningExercise: Exercise;
  public exerciseChanged = new Subject<Exercise>();

  getAvailableExercises() {
    return this.availableExercises.slice();
  }

  startExercise(selectedId: string) {
    const selectedExercise = this.availableExercises.find(
      (ex) => ex.id === selectedId
    );
    this.runningExercise = selectedExercise;
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }
}
```

The subscription makes sure that if an exercise was emitted, the ongoingTraining property will be set to true.

```typescript
export class TrainingComponent implements OnInit, OnDestroy {
  public ongoingTraining: boolean = false;
  public exerciseSubscription: Subscription;

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    this.exerciseSubscription = this.trainingService.exerciseChanged.subscribe(
      (ex) => {
        if (ex) {
          this.ongoingTraining = true;
        } else {
          this.ongoingTraining = false;
        }
      }
    );
  }
}
```

We can now create the event handler in the new-training component and pass onto it the chosen exercise using a form.

```typescript
export class NewTrainingComponent implements OnInit {
  exercises: Exercise[];

  constructor(private trainingService: TrainingService) {}

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise); // pass the form
  }
}
```

```html
<form #f="ngForm" (ngSubmit)="onStartTraining(f)">
  <mat-select ngModel name="exercise" required>
    <mat-option *ngFor="let exercise of exercises" [value]="exercise.id"
      >{{ exercise.name }}
    </mat-option>
  </mat-select>
</form>
```

We also ened to make sure that the service is updated when the training finishes or is cancelled. We add the following methods to our training service.

```typescript
  completeExercise() {
    this.exercises.push({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed',
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.exercises.push({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled',
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }
```

We can then use these methods on the current-training component

```typescript
export class CurrentTrainingComponent implements OnInit {
  progress = 0;
  timer: any;

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    this.startOrResumeTimer();
  }

  startOrResumeTimer() {
    const step =
      (this.trainingService.getRunningExercise().duration / 100) * 1000; // divide by fix max percentage (100) then multiply by 1000ms

    this.timer = setInterval(() => {
      this.progress = this.progress + 1;
      if (this.progress >= 100) {
        this.trainingService.completeExercise();
        clearInterval(this.timer);
      }
    }, step);
  }

  onStop() {
    clearInterval(this.timer);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result); // true or false
      if (result) {
        // user stops training
        this.trainingService.cancelExercise(this.progress);
      } else {
        // user doesnt stop training
        this.startOrResumeTimer();
      }
    });
  }
}
```
