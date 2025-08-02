import { Controller, Post, Param, Res, Body, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { ExportService, ExportOptions } from './export.service'; //  Import from service file
import { DecksService } from '../decks/decks.service';
import { UsersService } from '../users/users.service';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';

interface FirebaseUser {
  uid: string;
  email: string;
  name?: string;
}

interface AuthenticatedRequest extends Request {
  user: FirebaseUser;
}

async function getUserFromRequest(req: AuthenticatedRequest, usersService: UsersService) {
  try {
    const user = await usersService.findByFirebaseUid(req.user.uid);
    if (!user) {
      throw new Error(`User not found for Firebase UID: ${req.user.uid}`);
    }
    return user;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

@Controller('export')
@UseGuards(FirebaseAuthGuard)
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly decksService: DecksService,
    private readonly usersService: UsersService
  ) {}

  /**
   * Export deck as PDF
   */
  @Post('pdf/:deckId')
  async exportPDF(
    @Param('deckId') deckId: string,
    @Body() options: Partial<ExportOptions> = {},
    @Res() res: Response,
    @Request() req: AuthenticatedRequest
  ): Promise<void> {
    try {
            
      const user = await getUserFromRequest(req, this.usersService);
      const deck = await this.decksService.findOne(deckId, user);
      
      if (!deck) {
        throw new HttpException('Deck not found', HttpStatus.NOT_FOUND);
      }

      const exportData = {
        title: deck.title || 'Untitled Presentation',
        description: deck.description,
        companyName: this.extractCompanyName(deck),
        createdAt: deck.createdAt,
        slides: deck.slides?.map(slide => ({
          title: slide.title || 'Untitled Slide',
          content: slide.content || '',
          type: slide.type || 'content',
          //  Only include manually added speaker notes
          notes: slide.speakerNotes && slide.speakerNotes.trim() ? slide.speakerNotes : undefined,
          imageSuggestions: slide.imageSuggestions || []
        })) || []
      };

            
      const pdfBuffer = await this.exportService.generatePDF(exportData, {
        includeNotes: options.includeNotes ?? true,
        template: options.template || 'professional',
        watermark: options.watermark
      });

      const filename = `${deck.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'pitch_deck'}_${Date.now()}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');

            res.send(pdfBuffer);

    } catch (error) {
            throw new HttpException(
        `PDF export failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Export deck as PowerPoint
   */
  @Post('pptx/:deckId')
  async exportPowerPoint(
    @Param('deckId') deckId: string,
    @Body() options: Partial<ExportOptions> = {},
    @Res() res: Response,
    @Request() req: AuthenticatedRequest
  ): Promise<void> {
    try {
            
      const user = await getUserFromRequest(req, this.usersService);
      const deck = await this.decksService.findOne(deckId, user);
      
      if (!deck) {
        throw new HttpException('Deck not found', HttpStatus.NOT_FOUND);
      }

      
      const exportData = {
        title: deck.title || 'Untitled Presentation',
        description: deck.description,
        companyName: this.extractCompanyName(deck),
        createdAt: deck.createdAt,
        slides: deck.slides?.map(slide => ({
          title: slide.title || 'Untitled Slide',
          content: slide.content || '',
          type: slide.type || 'content',
          //  Only include manually added speaker notes
          notes: slide.speakerNotes && slide.speakerNotes.trim() ? slide.speakerNotes : undefined,
          imageSuggestions: slide.imageSuggestions || []
        })) || []
      };

            
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('PowerPoint generation timeout')), 30000);
      });

      const pptxBuffer = await Promise.race([
        this.exportService.generatePowerPoint(exportData, {
          includeNotes: options.includeNotes ?? true,
          template: options.template || 'professional',
          watermark: options.watermark
        }),
        timeoutPromise
      ]);

      const filename = `${deck.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'pitch_deck'}_${Date.now()}.pptx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pptxBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');

            res.send(pptxBuffer);

    } catch (error) {
            
      if (!res.headersSent) {
        res.status(500).json({
          message: `PowerPoint export failed: ${error.message}`,
          error: error.name
        });
      }
    }
  }

  // ========== HELPER METHODS ==========

  /**
   * Extract company name from deck title
   */
  private extractCompanyName(deck: any): string {
    if (deck.title) {
      const cleaned = deck.title.replace(/\s*(pitch\s*deck|presentation|deck)$/i, '').trim();
      if (cleaned && cleaned !== deck.title) {
        return cleaned;
      }
    }
    return 'Company';
  }
}