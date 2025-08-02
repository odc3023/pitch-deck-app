import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface CreateUserFromFirebaseDto {
  firebaseUid: string;
  email: string;
  name?: string;
}

export interface UpdateUserProfileDto {
  name?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /*Create or update user from Firebase Auth data*/
  async syncUserFromFirebase(firebaseData: CreateUserFromFirebaseDto): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { firebaseUid: firebaseData.firebaseUid }
    });

    if (user) {
      // Update existing user with latest Firebase data
      user.email = firebaseData.email;
      user.name = firebaseData.name || user.name;
      return this.usersRepository.save(user);
    } else {
      // Create new user
      user = this.usersRepository.create({
        firebaseUid: firebaseData.firebaseUid,
        email: firebaseData.email,
        name: firebaseData.name || firebaseData.email.split('@')[0],
      });
      return this.usersRepository.save(user);
    }
  }

  /*Find user by Firebase UID*/
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { firebaseUid }
    });
  }

  /*Update user profile*/
  async updateProfile(firebaseUid: string, updateData: UpdateUserProfileDto): Promise<User> {
    const user = await this.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  /*Delete user account*/
  async deleteUser(firebaseUid: string): Promise<void> {
    const user = await this.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(user);
  }

}