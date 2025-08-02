import { Deck } from 'src/decks/entities/deck.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  firebaseUid: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  name: string;

  @OneToMany(() => Deck, deck => deck.user)
  decks: Deck[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}