import { IItemEntry, IItemEntryDTO } from "./ItemEntry";

export interface IBillDTO {
  vendorId: number,
  billNumber: string,
  billDate: Date,
  dueDate: Date,
  referenceNo: string,
  status: string,
  note: string,
  amount: number,
  paymentAmount: number,
  entries: IItemEntryDTO[],
};

export interface IBillEditDTO {
  billDate: Date,
  dueDate: Date,
  referenceNo: string,
  status: string,
  note: string,
  amount: number,
  paymentAmount: number,
  entries: IItemEntryDTO[],
};

export interface IBill {
  id?: number,

  vendorId: number,
  billNumber: string,
  billDate: Date,
  dueDate: Date,
  referenceNo: string,
  status: string,
  note: string,
  amount: number,
  paymentAmount: number,

  invLotNumber: string,

  entries: IItemEntry[],
};
  