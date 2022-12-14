import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

import { Exercise } from 'src/app/models/exercise.model';
import { TrainingService } from '../training.service';
import { UIService } from 'src/app/shared/ui.service';
import { Store } from '@ngrx/store';

import * as fromTraining from '../training.reducer';
import * as fromRoot from '../../app.reducer';
@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css'],
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  // exercises: Exercise[];
  exercises$: Observable<Exercise[]>;
  // isLoading: boolean = true;
  isLoading$: Observable<boolean>;
  // private loadingSubs: Subscription;
  // private exerciseSubscription: Subscription;

  constructor(
    private trainingService: TrainingService,
    private uiService: UIService,
    private store: Store<fromTraining.State>
  ) {}

  ngOnInit(): void {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    // this.loadingSubs = this.uiService.loadingStateChanged.subscribe(
    //   (isLoading) => (this.isLoading = isLoading)
    // );
    this.exercises$ = this.store.select(fromTraining.getAvailableExercises);
    // this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(
    //   (exercises) => (this.exercises = exercises)
    // );
    this.fetchExercises();
  }

  fetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

  ngOnDestroy(): void {
    // if (this.exerciseSubscription) {
    //   this.exerciseSubscription.unsubscribe();
    // }
    // if (this.loadingSubs) {
    //   this.loadingSubs.unsubscribe();
    // }
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise); // pass the form
  }
}
