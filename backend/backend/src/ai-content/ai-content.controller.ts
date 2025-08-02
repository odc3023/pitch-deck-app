import { Controller, Post, Body } from '@nestjs/common';
import { AiContentService } from './ai-content.service';
import type { 
  GenerateDeckOutlineDto, 
  RegenerateSlideDto, 
  AiAssistantDto
} from './ai-content.service';

@Controller('ai')
export class AiContentController {
  constructor(private readonly aiContentService: AiContentService) {}

  /**
   * Generate complete deck outline with slides and images
   */
  @Post('generate-deck')
  async generateDeck(@Body() generateDeckDto: GenerateDeckOutlineDto) {
    try {
      const result = await this.aiContentService.generateDeckOutline(generateDeckDto);

      return {
        success: true,
        data: {
          outline: result.outline,
          slides: result.slides,
          inputs: generateDeckDto,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to generate deck outline',
      };
    }
  }

  /**
   * Suggest images for existing slide content
   */
  @Post('suggest-images')
  async suggestImages(@Body() slideData: { title: string; content: string; type?: string }) {
    try {
      const suggestions = await this.aiContentService.suggestImages(slideData);

      return {
        success: true,
        data: { suggestions },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to suggest images',
      };
    }
  }

  /**
   * Regenerate slide with fresh content and images
   */
  @Post('regenerate-slide')
  async regenerateSlide(@Body() regenerateSlideDto: RegenerateSlideDto) {
    try {
      const result = await this.aiContentService.regenerateSlide(regenerateSlideDto);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to regenerate slide',
      };
    }
  }

  /**
   * Health check endpoint
   */
  @Post('health')
  async healthCheck() {
    try {
      const isHealthy = await this.aiContentService.healthCheck();

      return {
        success: true,
        data: { 
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Health check failed',
      };
    }
  }

  /**
   * Unified AI Assistant for pitch refinement and speaker notes
   */
  @Post('ai-assistant')
  async aiAssistant(@Body() aiAssistantDto: AiAssistantDto) {
    try {
      if (!aiAssistantDto.message) {
        return {
          success: false,
          error: 'Message is required',
        };
      }

      const response = await this.aiContentService.aiAssistant(aiAssistantDto);

      return {
        success: true,
        data: { 
          response,
          intent: aiAssistantDto.assistType || 'auto-detected',
          timestamp: new Date().toISOString()
        },
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to process AI assistance request',
      };
    }
  }
}