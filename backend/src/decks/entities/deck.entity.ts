import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export interface Slide {
  id: string;
  title: string;
  content: string;
  type?: 'title' | 'content' | 'image' | 'chart';
  order: number;
  imagePrompts?: string[];
  imageSuggestions?: ImageSuggestion[];
  speakerNotes?: string;
}

export interface ImageSuggestion {
  type: 'stock' | 'icon' | 'chart' | 'diagram' | 'illustration';
  description: string;
  searchTerms: string[];
  altText: string;
  style?: string;
}

@Entity('decks')
export class Deck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.decks, { eager: false, nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'jsonb',
    default: '[]',
    transformer: {
      to: (value: Slide[]) => {
                return JSON.stringify(value || []);
      },
      from: (value: any) => {
                if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
                        return parsed;
          } catch (e) {
                        return [];
          }
        }
        return [];
      }
    }
  })
  slides: Slide[];

  @Column({ default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  @Column({ nullable: true })
  thumbnail?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}