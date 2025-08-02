import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Body, 
  UseGuards, 
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { UsersService, UpdateUserProfileDto } from './users.service';

// Type for authenticated request
interface FirebaseUser {
  uid: string;
  email: string;
  name?: string;
}

interface AuthenticatedRequest extends Request {
  user: FirebaseUser;
}

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user's profile
   */
  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest) {
    const firebaseUser = req.user;
    
    const user = await this.usersService.syncUserFromFirebase({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.name || firebaseUser.email.split('@')[0], // Fallback if no name
    });

    return {
      success: true,
      data: user
    };
  }

  /**
   * Sync Firebase user with database (usually called on login)
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncUserProfile(@Request() req: AuthenticatedRequest) {
    const firebaseUser = req.user;
    
    const user = await this.usersService.syncUserFromFirebase({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.name || firebaseUser.email.split('@')[0], // Fallback if no name
    });

    return {
      success: true,
      message: 'User profile synced successfully',
      data: user
    };
  }

  /**
   * Update user profile
   */
  @Put('profile')
  async updateProfile(@Request() req: AuthenticatedRequest, @Body() updateData: UpdateUserProfileDto) {
    const firebaseUser = req.user;
    
    const updatedUser = await this.usersService.updateProfile(
      firebaseUser.uid, 
      updateData
    );

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    };
  }

  /**
   * Delete user account
   */
  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Request() req: AuthenticatedRequest) {
    const firebaseUser = req.user;
    
    await this.usersService.deleteUser(firebaseUser.uid);

    return {
      success: true,
      message: 'Account deleted successfully'
    };
  }
}