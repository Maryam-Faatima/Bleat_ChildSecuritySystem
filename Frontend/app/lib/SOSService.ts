// SOSService for emergency SOS handling
import { NotificationService } from './NotificationService';

export class SOSService {
  static sendSOS(parent: any, child: any): boolean {
    console.log(`SOS triggered for child ${child.name}`);
    NotificationService.notifyParent(parent, {
      type: 'SOS',
      description: `Emergency SOS from ${child.name}`,
      timestamp: new Date().toISOString(),
    });
    return true;
  }

  static notifyEmergencyServices(contact: any): boolean {
    console.log(`Emergency contact notified: ${contact.name}`);
    return true;
  }

  static cancelSOS(childId: number): boolean {
    console.log(`SOS cancelled for child ${childId}`);
    return true;
  }
}
