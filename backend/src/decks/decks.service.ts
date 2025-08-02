import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deck, Slide } from './entities/deck.entity';
import { User } from '../users/entities/user.entity';
import { AiContentService } from '../ai-content/ai-content.service';

export interface CreateDeckDto {
  title: string;
  description?: string;
  slides?: Slide[];
}

export interface UpdateDeckDto {
  title?: string;
  description?: string;
  slides?: Slide[];
  status?: 'draft' | 'published' | 'archived';
}

export interface GenerateDeckDto {
  company: string;
  industry: string;
  problem: string;
  solution: string;
  model: string;
  financials: string;
}

@Injectable()
export class DecksService {
  constructor(
    @InjectRepository(Deck)
    private decksRepository: Repository<Deck>,
    private aiContentService: AiContentService,
  ) {}


  async findAllByUser(user: User): Promise<Deck[]> {
        
    try {
      const decks = await this.decksRepository.find({
        where: { 
          userId: user.id 
        },
        order: { 
          updatedAt: 'DESC' 
        }
      });

            return decks;

    } catch (error) {
            throw new Error(`Failed to find decks: ${error.message}`);
    }
  }

  async findOne(id: string, user: User): Promise<Deck> {
    const deck = await this.decksRepository.findOne({
      where: { 
        id,
        userId: user.id //  Filter by userId directly
      }
    });

    if (!deck) {
      throw new NotFoundException('Deck not found or access denied');
    }

    return deck;
  }

  async create(createDeckDto: CreateDeckDto, user: User): Promise<Deck> {
        
    const deck = this.decksRepository.create({
      ...createDeckDto,
      userId: user.id, 
      slides: createDeckDto.slides || [],
    });

    const savedDeck = await this.decksRepository.save(deck);
        
    return savedDeck;
  }

  async update(id: string, updateDeckDto: UpdateDeckDto, user: User): Promise<Deck> {
    const deck = await this.findOne(id, user); // Already checks ownership
    
    Object.assign(deck, updateDeckDto);
    return this.decksRepository.save(deck);
  }

  async remove(id: string, user: User): Promise<void> {
    const result = await this.decksRepository.delete({
      id,
      userId: user.id
    });

    if (result.affected === 0) {
      throw new NotFoundException('Deck not found or access denied');
    }
  }

  async generateFromInputs(generateDeckDto: GenerateDeckDto, user: User): Promise<Deck> {
    try {
      const aiResult = await this.aiContentService.generateDeckOutline(generateDeckDto);
      
      let slides: Slide[] = [];
      
      if (aiResult.slides && aiResult.slides.length > 0) {
        slides = aiResult.slides.map((aiSlide, index) => ({
          id: `slide-${index + 1}`,
          title: aiSlide.title,
          content: aiSlide.content,
          type: aiSlide.type || 'content',
          order: index + 1,
          imagePrompts: aiSlide.imageSuggestions?.map(img => img.description) || [],
          imageSuggestions: aiSlide.imageSuggestions || [],
        }));
      } else {
        slides = this.createFallbackSlides(generateDeckDto);
      }

      const deck = this.decksRepository.create({
        title: `${generateDeckDto.company} Pitch Deck`,
        description: `AI-generated pitch deck for ${generateDeckDto.company}`,
        slides: slides,
        userId: user.id,
        status: 'draft',
      });

      const savedDeck = await this.decksRepository.save(deck);      
      return savedDeck;
    } catch (error) {
      throw new Error(`Failed to generate deck: ${error.message}`);
    }
  }

  async addSlide(deckId: string, slide: Omit<Slide, 'id'>, user: User): Promise<Deck> {
    const deck = await this.findOne(deckId, user);
    
    const newSlide: Slide = {
      ...slide,
      id: `slide-${Date.now()}`,
    };

    deck.slides.push(newSlide);
    return this.decksRepository.save(deck);
  }

  async updateSlide(deckId: string, slideId: string, slideUpdate: Partial<Slide>, user: User): Promise<Deck> {
    const deck = await this.findOne(deckId, user);
    
    const slideIndex = deck.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) {
      throw new NotFoundException('Slide not found');
    }

    deck.slides[slideIndex] = { ...deck.slides[slideIndex], ...slideUpdate };
    return this.decksRepository.save(deck);
  }

  async removeSlide(deckId: string, slideId: string, user: User): Promise<Deck> {
    const deck = await this.findOne(deckId, user);
    
    deck.slides = deck.slides.filter(s => s.id !== slideId);
    return this.decksRepository.save(deck);
  }

  async reorderSlides(deckId: string, slideIds: string[], user: User): Promise<Deck> {
    const deck = await this.findOne(deckId, user);
    
    const reorderedSlides = slideIds.map((slideId, index) => {
      const slide = deck.slides.find(s => s.id === slideId);
      if (!slide) throw new NotFoundException(`Slide ${slideId} not found`);
      return { ...slide, order: index + 1 };
    });

    deck.slides = reorderedSlides;
    return this.decksRepository.save(deck);
  }

  //  Fallback slides helper
  private createFallbackSlides(inputs: GenerateDeckDto): Slide[] {
    const timestamp = Date.now();
    
    return [
      {
        id: `slide-1-${timestamp}`,
        title: 'Cover',
        content: `${inputs.company}\n\n${inputs.industry} Innovation\n\nSeed Stage - Series A Ready`,
        type: 'title',
        order: 1,
      },
      {
        id: `slide-2-${timestamp}`,
        title: 'Problem',
        content: inputs.problem + '\n\n• Market pain points\n• Current solutions are inadequate\n• Large addressable market',
        type: 'content',
        order: 2,
        imagePrompts: ['Problem illustration', 'Challenge visualization'],
        imageSuggestions: [{
          type: 'icon',
          description: 'Icon representing challenges or problems',
          searchTerms: ['problem', 'challenge', 'pain point', 'frustration'],
          altText: 'Icon representing the problem being solved',
        }],
      },
      {
        id: `slide-3-${timestamp}`,
        title: 'Solution',
        content: inputs.solution + '\n\n• Unique value proposition\n• Key differentiators\n• Technology/approach overview',
        type: 'content',
        order: 3,
        imagePrompts: ['Solution concept', 'Innovation visualization'],
        imageSuggestions: [{
          type: 'diagram',
          description: 'Flow diagram showing the solution process',
          searchTerms: ['solution', 'innovation', 'process', 'workflow'],
          altText: 'Diagram illustrating the solution approach',
        }],
      },
      {
        id: `slide-4-${timestamp}`,
        title: 'Market Opportunity',
        content: `Market Size: $X billion TAM\n\nTarget Market:\n• Primary segment\n• Secondary opportunities\n• Growth projections`,
        type: 'content',
        order: 4,
        imagePrompts: ['Market growth chart', 'Industry statistics'],
      },
      {
        id: `slide-5-${timestamp}`,
        title: 'Business Model',
        content: inputs.model + '\n\n• Revenue streams\n• Pricing strategy\n• Unit economics',
        type: 'content',
        order: 5,
      },
      {
        id: `slide-6-${timestamp}`,
        title: 'Traction & Financials',
        content: inputs.financials + '\n\n• Key metrics\n• Growth trajectory\n• Revenue projections',
        type: 'chart',
        order: 6,
      },
      {
        id: `slide-7-${timestamp}`,
        title: 'Competition',
        content: 'Competitive landscape analysis\n\n• Direct competitors\n• Indirect competitors\n• Our competitive advantage',
        type: 'content',
        order: 7,
      },
      {
        id: `slide-8-${timestamp}`,
        title: 'Team',
        content: 'Meet the founding team\n\n• CEO/Founder background\n• Key team members\n• Advisory board',
        type: 'content',
        order: 8,
      },
      {
        id: `slide-9-${timestamp}`,
        title: 'Funding Ask',
        content: 'Investment details\n\n• Amount seeking: $X\n• Use of funds\n• Milestones to achieve',
        type: 'content',
        order: 9,
      },
    ];
  }
}