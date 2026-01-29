import { IndexedEntity } from "./core-utils";
import type { User, Request, Notification } from "@shared/types";
import { MOCK_USERS, MOCK_REQUESTS } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "", role: "WARGA", isOnline: false };
  static seedData = MOCK_USERS;
}
export class RequestEntity extends IndexedEntity<Request> {
  static readonly entityName = "request";
  static readonly indexName = "requests";
  static readonly initialState: Request = {
    id: "",
    userId: "",
    status: "PENDING",
    wasteType: "ORGANIC",
    weightEstimate: 0,
    location: { lat: 0, lng: 0, address: "" },
    photos: [],
    createdAt: 0,
    updatedAt: 0
  };
  static seedData = MOCK_REQUESTS;
}
export class NotificationEntity extends IndexedEntity<Notification> {
  static readonly entityName = "notification";
  static readonly indexName = "notifications";
  static readonly initialState: Notification = {
    id: "",
    userId: "",
    title: "",
    message: "",
    type: 'INFO',
    read: false,
    createdAt: 0
  };
}