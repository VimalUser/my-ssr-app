import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LoggingService } from '../../shared/logging.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-adminactionshome',
  imports: [RouterModule],
  templateUrl: './adminactionshome.html',
  styleUrl: './adminactionshome.css'
})
export class Adminactionshome implements OnInit {

  clientId: string | null = null;
  username: string ="";

  constructor(private loggingService: LoggingService, private route: ActivatedRoute,  ) {
    // You can initialize any required services or data here
    
  }

  ngOnInit(): void {
    
this.route.paramMap.subscribe((params) => {
      this.clientId = params.get('id') ?? '';
    });
    // Initialization logic can go here
      this.loggingService.username$.subscribe(name => {
      this.username = name;
    });
    
    alert(`Welcome ${this.username}`);
  }

}
