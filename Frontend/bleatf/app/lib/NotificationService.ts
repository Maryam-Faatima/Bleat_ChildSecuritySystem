// NotificationService for sending alerts and messages
export class NotificationService {
  static sendAlert(alert: any): boolean {
    console.log('Notification: Alert sent', alert);
    return true;
  }

  static sendMessage(message: any): boolean {
    console.log('Notification: Message sent', message);
    return true;
  }

  static notifyParent(parent: any, alert: any): void {
    console.log(`Notification sent to parent ${parent.name}:`, alert);
  }
}
