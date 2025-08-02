import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { DecksService, CreateDeckDto, UpdateDeckDto, GenerateDeckDto } from './decks.service';
import { UsersService } from '../users/users.service';
import { Slide } from './entities/deck.entity';

interface FirebaseUser {
  uid: string;
  email: string;
  name?: string;
}

interface AuthenticatedRequest extends Request {
  user: FirebaseUser;
}

interface AddSlideDto {
  title: string;
  content: string;
  type?: 'title' | 'content' | 'image' | 'chart';
  order: number;
  imagePrompts?: string[];
  imageSuggestions?: any[];
}

interface UpdateSlideDto {
  title?: string;
  content?: string;
  type?: 'title' | 'content' | 'image' | 'chart';
  order?: number;
  imagePrompts?: string[];
  imageSuggestions?: any[];
}

interface ReorderSlidesDto {
  slideIds: string[];
}

async function getUserFromRequest(req: AuthenticatedRequest, usersService: UsersService) {
  const user = await usersService.findByFirebaseUid(req.user.uid);
  if (!user) {
    throw new Error('User not found. Please log in again.');
  }
  return user;
}

@Controller('decks')
@UseGuards(FirebaseAuthGuard)
export class DecksController {
  constructor(
    private readonly decksService: DecksService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Get all decks for the current user
   */
  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    try {
      const user = await getUserFromRequest(req, this.usersService);
      const decks = await this.decksService.findAllByUser(user);

      return {
        success: true,
        data: decks.map(deck => {
          let slideCount = 0;
          try {
            if (Array.isArray(deck.slides)) {
              slideCount = deck.slides.length;
            } else if (typeof deck.slides === 'string') {
              const parsed = JSON.parse(deck.slides);
              slideCount = Array.isArray(parsed) ? parsed.length : 0;
            } else if (deck.slides && typeof deck.slides === 'object' && 'length' in deck.slides) {
              slideCount = (deck.slides as any).length;
            } else if (deck.slides && typeof deck.slides === 'object') {
              slideCount = Object.keys(deck.slides).length;
            }
          } catch (error) {
            slideCount = 0;
          }

          return {
            id: deck.id,
            title: deck.title,
            description: deck.description,
            status: deck.status,
            slideCount: slideCount,
            thumbnail: deck.thumbnail || 'bg-gradient-to-br from-blue-500 to-purple-600',
            createdAt: deck.createdAt,
            updatedAt: deck.updatedAt,
            slides: deck.slides
          };
        })
      };

    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch decks'
      };
    }
  }

  /**
   * Get a specific deck by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    try {
      const user = await getUserFromRequest(req, this.usersService);
      const deck = await this.decksService.findOne(id, user);

      return { success: true, data: deck };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new deck
   */
  @Post()
  async create(@Body() createDeckDto: CreateDeckDto, @Request() req: AuthenticatedRequest) {
    try {
      const user = await getUserFromRequest(req, this.usersService);
      const deck = await this.decksService.create(createDeckDto, user);

      return {
        success: true,
        message: 'Deck created successfully',
        data: deck
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate a deck from AI inputs
   */
  @Post('generate')
  async generateDeck(@Body() generateDeckDto: GenerateDeckDto, @Request() req: AuthenticatedRequest) {
    try {
      const user = await getUserFromRequest(req, this.usersService);
      const deck = await this.decksService.generateFromInputs(generateDeckDto, user);

      return {
        success: true,
        message: 'Deck generated successfully',
        data: deck
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing deck
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDeckDto: UpdateDeckDto,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      const user = await getUserFromRequest(req, this.usersService);
      const deck = await this.decksService.update(id, updateDeckDto, user);

      return {
        success: true,
        message: 'Deck updated successfully',
        data: deck
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a deck
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    try {
      const user = await getUserFromRequest(req, this.usersService);
      await this.decksService.remove(id, user);

      return {
        success: true,
        message: 'Deck deleted successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a slide to a deck
   */
  @Post(':id/slides')
  async addSlide(
    @Param('id') deckId: string,
    @Body() addSlideDto: AddSlideDto,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      const user = await getUserFromRequest(req, this.usersService);
      const deck = await this.decksService.addSlide(deckId, addSlideDto, user);

      return {
        success: true,
        message: 'Slide added successfully',
        data: deck
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a specific slide
   */
  @Put(':id/slides/:slideId')
  async updateSlide(
    @Param('id') deckId: string,
    @Param('slideId') slideId: string,
    @Body() updateSlideDto: UpdateSlideDto,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      const user = await getUserFromRequest(req, this.usersService);
      const deck = await this.decksService.updateSlide(deckId, slideId, updateSlideDto, user);

      return {
        success: true,
        message: 'Slide updated successfully',
        data: deck
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a slide from a deck
   */
  @Delete(':id/slides/:slideId')
  async removeSlide(
    @Param('id') deckId: string,
    @Param('slideId') slideId: string,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      const user = await getUserFromRequest(req, this.usersService);
      const deck = await this.decksService.removeSlide(deckId, slideId, user);

      return {
        success: true,
        message: 'Slide deleted successfully',
        data: deck
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reorder slides in a deck
   */
  @Put(':deckId/reorder-slides')
  async reorderSlides(
    @Param('deckId') deckId: string,
    @Body() reorderSlidesDto: ReorderSlidesDto,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      const user = await getUserFromRequest(req, this.usersService);
      const deck = await this.decksService.reorderSlides(deckId, reorderSlidesDto.slideIds, user);

      return {
        success: true,
        message: 'Slides reordered successfully',
        data: deck
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}