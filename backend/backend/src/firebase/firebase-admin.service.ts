import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY');
      const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
      const projectId = this.configService.get('FIREBASE_PROJECT_ID');

      if (!privateKey || !clientEmail || !projectId) {
                return;
      }

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          clientEmail,
        }),
      });

          } else {
      this.firebaseApp = admin.app();
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new Error(`Invalid Firebase token: ${error.message}`);
    }
  }

  getAuth() {
    return admin.auth();
  }

  getFirestore() {
    return admin.firestore();
  }
}