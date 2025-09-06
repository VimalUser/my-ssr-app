import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoggingService } from '../../shared/logging.service';

@Component({
  selector: 'app-adminactionshome',
  imports: [RouterModule],
  templateUrl: './adminactionshome.html',
  styleUrl: './adminactionshome.css'
})
export class Adminactionshome implements OnInit {

  clientId: number | null = null;
  username: string ="";

  constructor(private loggingService: LoggingService  ) {
    // You can initialize any required services or data here
    
  }
  ngOnInit(): void {
    // Initialization logic can go here
    this.clientId = 4; // Example client ID, replace with actual logic to get the client ID
      this.loggingService.username$.subscribe(name => {
      this.username = name;
    });
    
    alert(`Welcome ${this.username}`);
  }

}
