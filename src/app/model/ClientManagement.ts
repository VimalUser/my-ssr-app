export interface DashBoardDto {
    clientId: number;
    orderNumber: string;
    clientName: string;
    eventType: string;
    totalPhotos: number;
    selectedPhotos: number;
    percentage: number;
    progress: string;
    adminStatus: string;
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

export interface AdminStatusInput
{
    clientId: number;
    adminStatus: string;
    updatedBy?: string;
}

export interface AdminStatusOutput
{
    clientId: number;
    photosUpload: CheckboxStatus;
    photosDownload: CheckboxStatus;
    loginInfo: CheckboxStatus;
    reviewComment: CheckboxStatus;
}

export interface CheckboxStatus
{
    isDisabled: boolean;
    isChecked: boolean;
}