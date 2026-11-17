import { config } from "../config.js";
import { CloudinaryStorageService } from "./cloudinary-storage.service.js";
import { LocalStorageService } from "./local-storage.service.js";
import { MemoryStorageService } from "./memory-storage.service.js";
import type { MediaStorageService } from "./types.js";

export function createStorageService(): MediaStorageService {
  if (config.storage.driver === "cloudinary") {
    return new CloudinaryStorageService();
  }
  if (config.storage.driver === "memory") {
    return new MemoryStorageService();
  }
  return new LocalStorageService();
}
