export enum EventType {
  POPUP_MOUNTED = 'popup-mounted',
  SEARCH = 'search',
}

export interface SearchResult {
  count: number;
  active: number;
}

export interface EventMessage {
  type: string;
  payload: PayloadObject;
}

export interface PayloadObject {
  [key: string]: string | number | boolean;
}