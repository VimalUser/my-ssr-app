import { AlbumSelectionItem } from "./album-selection-item.model";

export class clientData {
  clientId : number = 0;
  clientName: string = '';
  status: string = '';
  albumName: string = '';
  albumEventDate: string = '';
  noOfPics: number = 0;
  noOfFrames: number = 0;
  coverPic: string = '';
  mobileNumber: string = '';
  eventTypeId: number = 0;
  albumSizeId: number = 0;
  frameSizeId: number = 0;
  eventType: string = '';
  albumSize: string = '';
  frameSize: string = ''
  tranditionalAlbumSelection: AlbumSelectionItem[] = [];
  candidAlbumSelection: AlbumSelectionItem[] = []; // If same structure, else type accordingly
  portraitFrameSelection: AlbumSelectionItem[] = []; // Define proper type if possible
  landscapeFrameSelection: AlbumSelectionItem[] = []; // Define proper type if possible
  coverSelection: AlbumSelectionItem[] = []; // Define proper type if possible
  passCode :string = '';
  createdBy:string = '';
  updatedBy:string = '';
  accessLink:string = '';
  isSubmitted:boolean = false;
}
