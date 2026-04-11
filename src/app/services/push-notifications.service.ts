import { Injectable } from '@angular/core';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationsService {
  private app: FirebaseApp | null     = null;
  private messaging: Messaging | null = null;

  /**
   * Solicita permiso de notificaciones, registra el SW de Firebase manualmente
   * y guarda el FCM token en localStorage bajo 'cp_fcm_token'.
   * Retorna el token o null si el usuario denegó el permiso.
   */
  async requestPermission(): Promise<string | null> {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('[PushTienda] Notificaciones no soportadas.');
      return null;
    }

    try {
      // Inicializar Firebase App
      this.app = getApps().length
        ? getApps()[0]
        : initializeApp(environment.firebase);

      this.messaging = getMessaging(this.app);

      // Registrar el SW de Firebase manualmente (sin Angular SW)
      const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;

      // Pedir permiso
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      // Obtener token FCM
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      if (token) {
        localStorage.setItem('cp_fcm_token', token);
        console.log('[PushTienda] Token FCM guardado ✅');
      }

      return token || null;
    } catch (err) {
      console.error('[PushTienda] Error al solicitar permiso:', err);
      return null;
    }
  }

  /**
   * Retorna el token FCM guardado si existe (sin pedir permiso de nuevo)
   */
  getSavedToken(): string | null {
    return localStorage.getItem('cp_fcm_token');
  }

  /**
   * Limpia el token al volver el pedido a null / cerrar sesión
   */
  clearToken(): void {
    localStorage.removeItem('cp_fcm_token');
  }
}
