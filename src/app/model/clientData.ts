import { AlbumSelectionItem } from './album-selection-item.model';

export class clientData {
  clientId: number = 0;
  clientName: string = '';
  status: string = '';
  albumName: string = '';
  albumEventDate: string = '';
  noOfPics: number = 0;
  noOfFrames: number = 0;
  noOfAlbumCover: number = 0;
  coverPic: string = '';
  designTypeId: number = 0;
  designType: string = '';
  mobileNumber: string = '';
  eventTypeId: number = 0;
  albumSizeId: number = 0;
  frameSizeId: number = 0;
  eventType: string = '';
  albumSize: string = '';
  frameSize: string = '';
  clientReviewComments: string = '';

  tranditionalAlbumSelection: AlbumSelectionItem[] = [];
  candidAlbumSelection: AlbumSelectionItem[] = [];
  portraitFrameSelection: AlbumSelectionItem[] = [];
  landscapeFrameSelection: AlbumSelectionItem[] = [];
  coverSelection: AlbumSelectionItem[] = [];

  passCode: string = '';
  createdBy: string = '';
  updatedBy: string = '';
  accessLink: string = '';
  isSubmitted: boolean = false;

  // 1. DESIGN TYPE LIST
  designTypeList: {
    designTypeName: string;
    designTypeId: number;
  }[] = [];

  // 2. EVENTS LIST
  events: {
    order: number;
    name: string;
    eventDate: string | null;
  }[] = [];
}

export class ClientMenuItems {
  static startPage: number = 0;
  static designPage: number = 1;
  static albumName: number = 2;
  static imageSelection: number = 3;
  static framePage: number = 4;
  static coverPage: number = 5;
  static submitForm: number = 6;
}
