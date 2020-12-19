import { IItemEntry, IItemEntryDTO } from "./ItemEntry";

export interface ISaleInvoice {
  id: number,
  balance: number,
  paymentAmount: number,
  invoiceDate: Date,
  dueDate: Date,
  dueAmount: number,
  customerId: number,
  entries: IItemEntry[],
  deliveredAt: string|Date,
}

export interface ISaleInvoiceDTO {
  invoiceDate: Date,
  dueDate: Date,
  referenceNo: string,
  invoiceNo: string,
  customerId: number,
  invoiceMessage: string,
  termsConditions: string,
  entries: IItemEntryDTO[],
  delivered: boolean,
}

export interface ISaleInvoiceCreateDTO extends ISaleInvoiceDTO {
  fromEstimateId: number,  
};

export interface ISaleInvoiceEditDTO extends ISaleInvoiceDTO {

};

export interface ISalesInvoicesFilter{
  page: number,
  pageSize: number,
};