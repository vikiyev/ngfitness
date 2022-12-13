# Ngfitness

[Live demo](https://vikiyev-fitness.web.app/)

This angular app is built following Max Schwarzmuller's course [Angular with Angular Material, Angularfire & NgRx](https://www.udemy.com/course/angular-full-app-with-angular-material-angularfire-ngrx/)

- [Ngfitness](#ngfitness)
  - [Template Driven Forms with Error and Validation](#template-driven-forms-with-error-and-validation)
  - [Datepicker with Age Restriction](#datepicker-with-age-restriction)
  - [Sidebar](#sidebar)
  - [Timer and Dialog](#timer-and-dialog)
  - [Authentication](#authentication)
  - [Route Guard](#route-guard)
  - [Storing Exercise Data](#storing-exercise-data)
  - [Firebase and Angularfire2](#firebase-and-angularfire2)
    - [Fetching Data](#fetching-data)
    - [Storing Data](#storing-data)
  - [Authentication](#authentication-1)
  - [Error Handling and Spinners](#error-handling-and-spinners)
  - [Splitting into Modules](#splitting-into-modules)
  - [Lazy Loading](#lazy-loading)
  - [NgRx](#ngrx)
    - [Multiple Reducers and Actions](#multiple-reducers-and-actions)
    - [Actions with Payloads](#actions-with-payloads)
    - [Reducers for lazy loaded modules](#reducers-for-lazy-loaded-modules)
  - [Deployment](#deployment)
  - [Theming](#theming)

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

## Firebase and Angularfire2

Firebase provides realtime databases, authentication, file storage, analytics, and cloud functions for ondemand server side code. For this project, we use Cloud Firestore and Authentication. Angularfire can be setup using `ng add @angular/fire`. Alternatively, we can use the compat packages to import angularfire into our app module:

```typescript
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
```

```typescript
// environments/environment.prod.ts

export const environment = {
  firebase: {
    projectId: "",
    appId: "",
    storageBucket: "",
    apiKey: "",
    authDomain: "",
    messagingSenderId: "",
  },
  production: true,
};
```

### Fetching Data

The **AngularFirestore.collection()** method allows us to reach out to a specific collection in our firestore. **valueChanges()** will give us a real time observable, meaning we do not need to refresh a page upon update, but it strips out the metadata such as id. We can instead listen to **snapshotChanges()** which stores a snapshot of the document to obtain the metadata.

We can use the map operator to map the obtained data and add back the id. We can also set up a Subject in the TrainingService to trigger whenever we receive new exercises to which we subscribe to from the NewTraining component.

```typescript
export class TrainingService {
  private availableExercises: Exercise[] = [];

  constructor(private db: AngularFirestore) {}

  fetchAvailableExercises() {
    this.db
      .collection("availableExercises")
      .snapshotChanges()
      .pipe(
        map((docArray) => {
          return docArray.map((doc) => {
            const data = doc.payload.doc.data() as Exercise;
            return {
              id: doc.payload.doc.id,
              ...data,
            };
          });
        })
      )
      .subscribe(
        (exercises: Exercise[]) => (this.availableExercises = exercises)
      );
  }
}
```

```typescript
export class NewTrainingComponent implements OnInit, OnDestroy {
  exercises: Exercise[];
  exerciseSubscription: Subscription;

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(
      (exercises) => (this.exercises = exercises)
    );
    this.trainingService.fetchAvailableExercises();
  }

  ngOnDestroy(): void {
    this.exerciseSubscription.unsubscribe();
  }
}
```

### Storing Data

We can save a document to the database using the **collection().add()** method, which returns a promise.

```typescript
  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }
```

To load the data into the table, we can set up a new subject that emits an event whenever a new exercise is added to finishedExercises. The listener is initialized with the method fetchCompletedOrCancelledExercises()

```typescript
@Injectable()
export class TrainingService {
  public finishedExercisesChanged = new Subject<Exercise[]>();

  fetchCompletedOrCancelledExercises() {
    this.db
      .collection("finishedExercises")
      .valueChanges()
      .subscribe((exercises: Exercise[]) => {
        this.finishedExercisesChanged.next(exercises);
      });
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection("finishedExercises").add(exercise);
  }
}
```

```typescript
export class PastTrainingComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<Exercise>();
  private exerciseChangedSubscription: Subscription;

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    this.exerciseChangedSubscription =
      this.trainingService.finishedExercisesChanged.subscribe(
        (exercises: Exercise[]) => {
          this.dataSource.data = exercises;
        }
      );
    this.trainingService.fetchCompletedOrCancelledExercises();
  }

  ngOnDestroy(): void {
    this.exerciseChangedSubscription.unsubscribe();
  }
}
```

## Authentication

We can use **AngularFireAuth** for authentication. In traditional web apps, the session is stored on the server and the client uses a cookie. In Single Page Applications, the backends are typically stateless. We need to use json web tokens to prove to firebase that a user is authenticated. Angularfire already manages the token for us through firebase and attaches the token automatically in outgoing requests.

```typescript
export class AuthService {
  public authChange = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(private router: Router, private afAuth: AngularFireAuth) {}

  registerUser(authData: AuthData) {
    this.afAuth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        console.log(result);
        this.authSuccessfully();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  login(authData: AuthData) {
    this.afAuth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        console.log(result);
        this.authSuccessfully();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  logout() {
    this.afAuth.signOut();
    this.isAuthenticated = false;
    this.authChange.next(false);
    this.router.navigate(["/login"]);
  }

  isAuth() {
    return this.isAuthenticated;
  }

  private authSuccessfully() {
    this.isAuthenticated = true;
    this.authChange.next(true);
    this.router.navigate(["/training"]);
  }
}
```

We can now configure firestore to lock down the database to only allow authenticated users to write.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

We also need to terminate our subscriptions from firestore when we log out. We can store the subscriptions in an array and then call the cancelSubscriptions() method from the AuthService when logging out.

```typescript
export class TrainingService {
  private fbSubs: Subscription[] = [];

  constructor(private db: AngularFirestore) {}

  fetchAvailableExercises() {
    this.fbSubs.push(
      this.db
        .collection("availableExercises")
        .snapshotChanges()
        .pipe(
          map((docArray) => {
            return docArray.map((doc) => {
              const data = doc.payload.doc.data() as Exercise;
              return {
                id: doc.payload.doc.id,
                ...data,
              };
            });
          })
        )
        .subscribe((exercises: Exercise[]) => {
          // console.log(exercises);
          this.availableExercises = exercises;
          this.exercisesChanged.next([...this.availableExercises]);
        })
    );
  }

  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(
      this.db
        .collection("finishedExercises")
        .valueChanges()
        .subscribe((exercises: Exercise[]) => {
          this.finishedExercisesChanged.next(exercises);
        })
    );
  }

  cancelSubscriptions() {
    this.fbSubs.forEach((sub) => sub.unsubscribe());
  }
}
```

Angularfire also provides an observable based auth status listener which listens to any changes on the authentication state. This emits a user object or a null. We can initialize this in the app component.

```typescript
export class AuthService {
  public authChange = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private trainingService: TrainingService
  ) {}

  initAuthListener() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.router.navigate(["/training"]);
      } else {
        this.trainingService.cancelSubscriptions();
        this.isAuthenticated = false;
        this.authChange.next(false);
        this.router.navigate(["/login"]);
      }
    });
  }

  registerUser(authData: AuthData) {
    this.afAuth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  login(authData: AuthData) {
    this.afAuth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  logout() {
    this.afAuth.signOut();
  }

  isAuth() {
    return this.isAuthenticated;
  }
}
```

```typescript
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.initAuthListener();
  }
}
```

## Error Handling and Spinners

For error handling, we can use the Snackbar component which can be opened programmatically by injecting **MatSnackBar**. For the progress spinners, we can create a UIService for controlling the ui globally. We can create a subject that will emit an event when the loading state changes which is represented by a boolean.

```typescript
  constructor(
    private snackbar: MatSnackBar
    private uiService: UIService
  ) {}

  login(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.afAuth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        this.uiService.loadingStateChanged.next(false);
      })
      .catch((err) => {
        console.error(err);
        this.uiService.loadingStateChanged.next(false);
        this.snackbar.open(err.message, null, {
          duration: 3000,
        });
      });
  }
```

```typescript
export class UIService {
  loadingStateChanged = new Subject<boolean>();
}
```

We subscribe to the loadingStateChanged listener in our components.

```typescript
export class LoginComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private loadingSubs: Subscription;
  emailInput = new FormControl('', [Validators.required, Validators.email]);

  constructor(private uiService: UIService) {}

  ngOnInit(): void {
    this.loadingSubs = this.uiService.loadingStateChanged.subscribe(
      (isLoading) => (this.isLoading = isLoading)
    );
  }

  ngOnDestroy(): void {
    this.loadingSubs.unsubscribe();
  }
```

## Splitting into Modules

The app can be split into feature modules for training and auth. We can create a SharedModule for modules that are shared across other modules. The SharedModule both imports and exports the modules to be shared to any other module that imports the shared module.

```typescript
@NgModule({
  imports: [CommonModule, FormsModule, MaterialModule, FlexLayoutModule],
  exports: [CommonModule, FormsModule, MaterialModule, FlexLayoutModule],
})
export class SharedModule {}
```

```typescript
@NgModule({
  declarations: [SignupComponent, LoginComponent],
  imports: [SharedModule, ReactiveFormsModule, AngularFireAuthModule],
  exports: [],
})
export class AuthModule {}
```

```typescript
@NgModule({
  declarations: [
    TrainingComponent,
    CurrentTrainingComponent,
    NewTrainingComponent,
    PastTrainingComponent,
    StopTrainingComponent,
  ],
  imports: [SharedModule],
  exports: [],
  entryComponents: [StopTrainingComponent],
})
export class TrainingModule {}
```

We can do the same with the AppRoutingModule by creating a new AuthRoutingModule. The **forChild()** method loads the routes into the global routes.

```typescript
const routes: Routes = [
  {
    path: "signup",
    component: SignupComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
```

Afterwards, we need to include the AuthRoutingModule component into the imports of AuthModule.

## Lazy Loading

For the Training components, we can use lazy loading as opposed to the Auth routes which were eagerly loaded. To implement lazy loading, we remove the TrainingComponent from the AppModule imports array. Then at the AppRoutingModule, we add a route to /training but use **loadChildren**.

```typescript
const routes: Routes = [
  {
    path: "",
    component: WelcomeComponent,
  },
  {
    path: "training",
    loadChildren: () =>
      import("./training/training.module").then((m) => m.TrainingModule),
    canLoad: [AuthGuard],
  },
];

export class AppRoutingModule {}
```

```typescript
const routes: Routes = [
  {
    path: "",
    component: TrainingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingRoutingModule {}
```

The AuthGuard is provided globally in the AppRoutingModule so that it will be a singleton. We do need to provide AuthGuard eagerly. We can do so by using **canLoad**. We then need to implement the **CanLoad** interface on the guard.

```typescript
@Injectable()
export class AuthGuard implements CanLoad {
  canLoad(route: Route) {
    if (this.authService.isAuth()) {
      return true;
    } else {
      this.router.navigate(["/login"]);
      return false;
    }
  }
}
```

## NgRx

We start by creating a store in our angular app. We can set up the StoreModule in the AppModule wherein we pass to the forRoot() function the main reducer.

```typescript
  imports: [
    StoreModule.forRoot({
      ui: appReducer,
    }),
  ],
```

We can create a reducer function which takes the old state as an input, and an incoming action. To be able to update the state, we need an action that triggers this change. We can use switch statements depending oon the action type.

```typescript
export interface State {
  isLoading: boolean;
}

const initialState: State = {
  isLoading: false,
};

export function appReducer(state = initialState, action) {
  switch (action.type) {
    case "START_LOADING":
      return {
        isLoading: true,
      };
    case "STOP_LOADING":
      return {
        isLoading: false,
      };
    default:
      return state;
  }
}
```

We need to be able to dispatch actions and listen for changes. We can inject the store into our AuthService. Using the store, we can dispatch an action, which is an object that has a type property.

```typescript
import * as fromApp from "../app.reducer";

@Injectable()
export class AuthService {
  constructor(private store: Store<{ ui: fromApp.State }>) {}

  registerUser(authData: AuthData) {
    // this.uiService.loadingStateChanged.next(true);
    this.store.dispatch({ type: "START_LOADING" });

    this.afAuth
      .createUserWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch({ type: "STOP_LOADING" });
      })
      .catch((err) => {
        console.error(err);
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch({ type: "STOP_LOADING" });
        this.uiService.showSnackbar(err.message, null, 3000);
      });
  }
}
```

We then need to subscribe from within our components and template.

```typescript
export class LoginComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;

  constructor(private store: Store<{ ui: fromApp.State }>) {}

  ngOnInit(): void {
    this.isLoading$ = this.store.pipe(map((state) => state.ui.isLoading));
  }
}
```

```html
<button
  mat-raised-button
  color="primary"
  type="submit"
  [disabled]="loginForm.invalid"
  *ngIf="!(isLoading$ | async)"
>
  Login
</button>
<mat-spinner *ngIf="isLoading$ | async"></mat-spinner>
```

### Multiple Reducers and Actions

The general procedures for setting up multiple reducers is as follows:

1. Set up action strings (ui.actions.ts)
2. Create subreducer (ui.reducer.ts)
3. Include subreducer into app-wide reducer and set up selectors (app.reducer.ts)
4. Import reducers into AppModule
5. Inject reducers into services and dispatch actions (auth.service.ts)
6. Consume from components (login.component.ts)

We start by creating a ui.actions.ts file for defining the actions and action creators.

```typescript
import { Action } from "@ngrx/store";

export const START_LOADING = "[UI] Start Loading";
export const STOP_LOADING = "[UI] Stop Loading";

export class StartLoading implements Action {
  readonly type = START_LOADING;
}

export class StopLoading implements Action {
  readonly type = STOP_LOADING;
}

export type UIActions = StartLoading | StopLoading;
```

We then import these constants into our reducer.

```typescript
import { UIActions, START_LOADING, STOP_LOADING } from "./ui.actions";

export interface State {
  isLoading: boolean;
}

const initialState: State = {
  isLoading: false,
};

export function uiReducer(state = initialState, action: UIActions) {
  switch (action.type) {
    case START_LOADING:
      return {
        isLoading: true,
      };
    case STOP_LOADING:
      return {
        isLoading: false,
      };
    default: {
      return state;
    }
  }
}

export const getIsLoading = (state: State) => state.isLoading;
```

We can use the uiReducer into our app-wide reducer. We can use selector functions to help easily pull out information from our state.

```typescript
import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
} from "@ngrx/store";
import * as fromUi from "./shared/ui.reducer";

export interface State {
  ui: fromUi.State;
}

export const reducers: ActionReducerMap<State> = {
  ui: fromUi.uiReducer,
};

export const getUiState = createFeatureSelector<fromUi.State>("ui");
export const getIsLoading = createSelector(getUiState, fromUi.getIsLoading);
```

We need to update the AppModule to use the app-wide reducer.

```typescript
  imports: [
    StoreModule.forRoot(reducers),
  ],
```

We can now try dispatching the actions in our AuthService.

```typescript
import { Store } from "@ngrx/store";
import * as fromRoot from "../app.reducer";
import * as UI from "../shared/ui.actions";

@Injectable()
export class AuthService {
  constructor(private store: Store<fromRoot.State>) {}

  login(authData: AuthData) {
    // this.uiService.loadingStateChanged.next(true);
    this.store.dispatch(new UI.StartLoading());
    this.afAuth
      .signInWithEmailAndPassword(authData.email, authData.password)
      .then((result) => {
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch(new UI.StopLoading());
      })
      .catch((err) => {
        console.error(err);
        // this.uiService.loadingStateChanged.next(false);
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(err.message, null, 3000);
      });
  }
}
```

We can now start consuming from our components.

```typescript
import * as fromRoot from "../../app.reducer";

export class LoginComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
  }
}
```

For the AuthGuard, we need to use the **take()** operator to take 1, since an auth guard constantly emits values.

```typescript
@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private store: Store<fromRoot.State>) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select(fromRoot.getIsAuth).pipe(take(1));
  }

  canLoad(route: Route) {
    return this.store.select(fromRoot.getIsAuth).pipe(take(1));
  }
}
```

### Actions with Payloads

For actions that require payloads, we need to create a public property payload on the action's class constructor.

```typescript
export const SET_AVAILABLE_TRAININGS = "[Training] Set Available Trainings";
export const SET_FINISHED_TRAININGS = "[Training] Set Finished Trainings";
export const START_TRAINING = "[Training] Start Training";
export const STOP_TRAINING = "[Training] Stop Training";

export class SetAvailableTrainings implements Action {
  readonly type = SET_AVAILABLE_TRAININGS;
  constructor(public payload: Exercise[]) {}
}

export class SetFinishedTrainings implements Action {
  readonly type = SET_FINISHED_TRAININGS;
  constructor(public payload: Exercise[]) {}
}

export class StartTraining implements Action {
  readonly type = START_TRAINING;
  constructor(public payload: string) {}
}

export class StopTraining implements Action {
  readonly type = STOP_TRAINING;
}

export type TrainingActions =
  | SetAvailableTrainings
  | SetFinishedTrainings
  | StartTraining
  | StopTraining;
```

We can then use the payload on our reducers.

```typescript
export interface TrainingState {
  availableExercises: Exercise[];
  finishedExercises: Exercise[];
  activeTraining: Exercise;
}

const initialState: TrainingState = {
  availableExercises: [],
  finishedExercises: [],
  activeTraining: null,
};

export function trainingReducer(state = initialState, action: TrainingActions) {
  switch (action.type) {
    case SET_AVAILABLE_TRAININGS:
      return {
        ...state,
        availableExercises: action.payload,
      };
    case SET_FINISHED_TRAININGS:
      return {
        ...state,
        finishedExercises: action.payload,
      };
    case START_TRAINING:
      return {
        ...state,
        activeTraining: {
          ...state.availableExercises.find((ex) => ex.id === action.payload),
        },
      };
    case STOP_TRAINING:
      return {
        ...state,
        activeTraining: null,
      };
    default: {
      return state;
    }
  }
}
```

### Reducers for lazy loaded modules

The Training module is lazily loaded hence we cannot add the training state to our ActionReducerMap. We can instead extend our training state to include the root state. Additionally, we need to import the reducer to the TrainingModule using the **StoreModule.forFeature()** method

```typescript
export interface TrainingState {
  availableExercises: Exercise[];
  finishedExercises: Exercise[];
  activeTraining: Exercise;
}

export interface State extends fromRoot.State {
  training: TrainingState;
}
```

```typescript
  imports: [
    StoreModule.forFeature('training', trainingReducer),
  ],
```

We can then create the selectors for our training reducer using **createFeatureSelector** and **createSelector**

```typescript
export const getTrainingState =
  createFeatureSelector<TrainingState>("training");
export const getAvailableExercises = createSelector(
  getTrainingState,
  (state: TrainingState) => state.availableExercises
);
export const getFinishedExercises = createSelector(
  getTrainingState,
  (state: TrainingState) => state.finishedExercises
);
export const getActiveTraining = createSelector(
  getTrainingState,
  (state: TrainingState) => state.activeTraining
);
```

To dispatch the actions, we can use the fromTraining reducer instead of fromRoot. We can still dispatch global actions since fromTraining extends the root reducer

```typescript
  constructor(
    private store: Store<fromTraining.State>
  ) {}

  fetchAvailableExercises() {
    this.fbSubs.push(
        //
        )
        .subscribe(
          (exercises: Exercise[]) => {
            // this.availableExercises = exercises;
            // this.exercisesChanged.next([...this.availableExercises]);
            this.store.dispatch(new Training.SetAvailableTrainings(exercises));
          },
          (err) => {
            //
          }
        )
    );
  }
```

## Deployment

To deploy to firebase hosting, we use `firebase init`. We enable hosting and configure `dist/ngfitness` as the public directory. Afterwards, we run `firebase deploy`

## Theming

[Reference](https://v14.material.angular.io/guide/theming#custom-themes-with-sass)

To customize the theme, we create an scss file under `src/my-theme.scss`

```scss
@use "@angular/material" as mat;
@include mat.core();

$my-primary: mat.define-palette(mat.$red-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

// The "warn" palette is optional and defaults to red if not specified.
$my-warn: mat.define-palette(mat.$red-palette);

$my-theme: mat.define-light-theme(
  (
    color: (
      primary: $my-primary,
      accent: $my-accent,
      warn: $my-warn,
    ),
  )
);

// Emit theme-dependent styles for common features used across multiple components.
@include mat.core-theme($my-theme);
```

We then include the theme in angular.json

```json
          "options": {
            "styles": ["src/my-theme.scss", "src/styles.css"],
          },
```
