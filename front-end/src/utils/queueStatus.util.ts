import { IQueue } from "@/interfaces/services/queue.interface";

// Backend raw statuses -> Frontend enum mapping
export function mapBackendQueueStatus(status: string): IQueue["status"] {
  switch (status) {
    case 'WAITING': return 'CLAIMED';
    case 'BEING_SERVED': return 'CALLED';
    case 'COMPLETED': return 'SERVED';
    case 'SKIPPED': return 'SKIPPED';
    default: return 'RESET';
  }
}
