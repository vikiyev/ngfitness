import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';

import { Exercise } from 'src/app/models/exercise.model';
import { TrainingService } from '../training.service';
import { UIService } from 'src/app/shared/ui.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css'],
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  exercises: Exercise[];
  isLoading: boolean = true;
  private loadingSubs: Subscription;
  private exerciseSubscription: Subscription;

  constructor(
    private trainingService: TrainingService,
    private uiService: UIService
  ) {}

  ngOnInit(): void {
    this.loadingSubs = this.uiService.loadingStateChanged.subscribe(
      (isLoading) => (this.isLoading = isLoading)
    );
    this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(
      (exercises) => (this.exercises = exercises)
    );
    this.fetchExercises();
  }

  fetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

  ngOnDestroy(): void {
    if (this.exerciseSubscription) {
      this.exerciseSubscription.unsubscribe();
    }

    if (this.loadingSubs) {
      this.loadingSubs.unsubscribe();
    }
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise); // pass the form
  }
}
