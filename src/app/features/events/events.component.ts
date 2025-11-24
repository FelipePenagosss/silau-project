import { Component } from '@angular/core';
import { SliderComponent } from '../../shared/slider/slider.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [SliderComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export default class EventsComponent {

}
