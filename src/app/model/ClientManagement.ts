export interface DashBoardDto {
  clientId: number;  
  orderNumber: string;
  clientName: string;
  eventType: string;
  totalPhotos: number;
  selectedPhotos: number;
  percentage: number;
  progress: string;
  noofComments: number;
}

export interface ClientManagement {
  totalClients: number;
  completedProject: number;
  inprogressProject: number;
  dashBoardData: DashBoardDto[];
}