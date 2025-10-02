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
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalClients: number;
    completedProject: number;
    inprogressProject: number;
    dashBoardData: DashBoardDto[];
}