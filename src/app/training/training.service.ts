import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, take } from 'rxjs';
import { Subscription } from 'rxjs';

import { Exercise } from '../models/exercise.model';
import { UIService } from '../shared/ui.service';
import { Store } from '@ngrx/store';

import * as fromTraining from './training.reducer';
import * as Training from './training.actions';
import * as UI from '../shared/ui.actions';

@Injectable()
export class TrainingService {
  // private availableExercises: Exercise[] = [];
  // private runningExercise: Exercise;
  private fbSubs: Subscription[] = [];
  // public exerciseChanged = new Subject<Exercise>();
  // public exercisesChanged = new Subject<Exercise[]>();
  // public finishedExercisesChanged = new Subject<Exercise[]>();

  constructor(
    private db: AngularFirestore,
    private uiService: UIService,
    private store: Store<fromTraining.State>
  ) {}

  fetchAvailableExercises() {
    // this.uiService.loadingStateChanged.next(true);
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.db
        .collection('availableExercises')
        .snapshotChanges()
        .pipe(
          map((docArray) => {
            // throw new Error(); // testing loading spinner
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
          (exercises: Exercise[]) => {
            // console.log(exercises);
            // this.uiService.loadingStateChanged.next(false);
            this.store.dispatch(new UI.StopLoading());
            // this.availableExercises = exercises;
            // this.exercisesChanged.next([...this.availableExercises]);
            this.store.dispatch(new Training.SetAvailableTrainings(exercises));
          },
          (err) => {
            // this.uiService.loadingStateChanged.next(false);
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching exercises failed, please try again later',
              null,
              3000
            );
            // this.exercisesChanged.next(null);
          }
        )
    );
  }

  // getRunningExercise() {
  //   return { ...this.runningExercise };
  // }

  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(
      this.db
        .collection('finishedExercises')
        .valueChanges()
        .subscribe((exercises: Exercise[]) => {
          // this.finishedExercisesChanged.next(exercises);
          this.store.dispatch(new Training.SetFinishedTrainings(exercises));
        })
    );
  }

  startExercise(selectedId: string) {
    // this.db
    //   .doc(`availableExercises/${selectedId}`)
    //   .update({ lastSelected: new Date() });

    // const selectedExercise = this.availableExercises.find(
    //   (ex) => ex.id === selectedId
    // );
    // this.runningExercise = selectedExercise;
    // this.exerciseChanged.next({ ...this.runningExercise });
    this.store.dispatch(new Training.StartTraining(selectedId));
  }

  completeExercise() {
    // this.addDataToDatabase({
    //   ...this.runningExercise,
    //   date: new Date(),
    //   state: 'completed',
    // });
    // this.runningExercise = null;
    // this.exerciseChanged.next(null);
    this.store
      .select(fromTraining.getActiveTraining)
      .pipe(take(1))
      .subscribe((ex: Exercise) => {
        this.addDataToDatabase({
          ...ex,
          date: new Date(),
          state: 'completed',
        });
        this.store.dispatch(new Training.StopTraining());
      });
  }

  cancelExercise(progress: number) {
    // this.addDataToDatabase({
    //   ...this.runningExercise,
    //   duration: this.runningExercise.duration * (progress / 100),
    //   calories: this.runningExercise.calories * (progress / 100),
    //   date: new Date(),
    //   state: 'cancelled',
    // });
    this.store
      .select(fromTraining.getActiveTraining)
      .pipe(take(1))
      .subscribe((ex: Exercise) => {
        this.addDataToDatabase({
          ...ex,
          duration: ex.duration * (progress / 100),
          calories: ex.calories * (progress / 100),
          date: new Date(),
          state: 'cancelled',
        });
        this.store.dispatch(new Training.StopTraining());
      });
    // this.runningExercise = null;
    // this.exerciseChanged.next(null);
    // this.store.dispatch(new Training.StopTraining());
  }

  cancelSubscriptions() {
    this.fbSubs.forEach((sub) => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }
}
