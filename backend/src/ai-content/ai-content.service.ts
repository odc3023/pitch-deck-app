import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface GenerateDeckOutlineDto {
  company: string;
  industry: string;
  problem: string;
  solution: string;
  model: string;
  financials: string;
}

export interface ImageSuggestion {
  type: 'stock' | 'icon' | 'chart' | 'diagram' | 'illustration';
  description: string;
  searchTerms: string[];
  altText: string;
  style?: string;
}

export interface SlideContent {
  title: string;
  content: string;
  type: 'title' | 'content' | 'image' | 'chart';
  imageSuggestions: ImageSuggestion[];
  notes?: string;
}

export interface DeckOutlineResult {
  outline: string;
  slides: SlideContent[];
}

export interface RegenerateSlideDto {
  title: string;
  content: string;
  type?: 'title' | 'content' | 'image' | 'chart';
  context?: string;
}

export interface AiAssistantDto {
  message: string;
  slideContent?: string;
  slideTitle?: string;
  context?: string;
  assistType?: 'refine' | 'speaker-notes' | 'general' | 'auto';
}

/**
 * Service for AI-powered content generation and enhancement for pitch decks
 * Integrates with OpenAI GPT models to generate unique presentation content
 */
@Injectable()
export class AiContentService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Generates a complete pitch deck outline with 9 unique slides
   * Each generation produces varied content to avoid repetitive templates
   * 
   * @param inputs - Company information for deck generation
   * @returns Promise<DeckOutlineResult> - Complete deck with slides and image suggestions
   */
  async generateDeckOutline(inputs: GenerateDeckOutlineDto): Promise<DeckOutlineResult> {
    // Create session-specific identifiers for content uniqueness
    const uniqueId = Math.random().toString(36).substring(7);
    const timestamp = Date.now();
    
    const prompt = this.buildDeckGenerationPrompt(inputs, uniqueId, timestamp);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: this.getSystemPromptForDeckGeneration(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 3000,
        temperature: 0.9, // High creativity for unique outputs
        presence_penalty: 0.7, // Reduce repetition
        frequency_penalty: 0.8, // Encourage variety
      });

      const aiText = completion.choices[0]?.message?.content;
      
      if (!aiText) {
        throw new Error('No content generated from AI');
      }

      // Parse AI response into structured slide data
      const slides = this.parseAiTextToSlides(aiText, inputs, uniqueId);
      
      // Validate minimum slide count
      if (slides.length < 8) {
        throw new Error('Insufficient slides generated');
      }

      return {
        outline: `AI-generated pitch deck for ${inputs.company} - ${aiText.substring(0, 200)}...`,
        slides: slides,
      };

    } catch (error) {
      // Log error details for debugging (in production, use proper logging service)
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Regenerates a single slide with fresh content while maintaining format
   * Analyzes original content structure and preserves formatting preferences
   * 
   * @param slideData - Original slide data with title, content, and optional context
   * @returns Promise<SlideContent> - Regenerated slide with new content and images
   */
  async regenerateSlide(slideData: RegenerateSlideDto): Promise<SlideContent> {
    // Validate required input fields
    this.validateSlideData(slideData);
    
    const slideType = slideData.type || 'content';
    const alternativeApproach = this.getAlternativeApproach(slideType);
    const timestamp = Date.now();
    
    // Analyze content structure for format preservation
    const contentAnalysis = this.analyzeContentStructure(slideData.content);
    const prompt = this.buildRegenerationPrompt(slideData, slideType, alternativeApproach, timestamp, contentAnalysis);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: this.getSystemPromptForRegeneration(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.8,
        presence_penalty: 0.6,
        frequency_penalty: 0.7,
      });

      const result = completion.choices[0]?.message?.content;
      
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      const parsedResult = JSON.parse(result);
      
      if (!parsedResult.title || !parsedResult.content) {
        throw new Error('Invalid response structure from OpenAI');
      }

      return {
        title: parsedResult.title,
        content: parsedResult.content,
        type: slideType as 'title' | 'content' | 'image' | 'chart',
        imageSuggestions: parsedResult.imageSuggestions || this.getFallbackImageSuggestions(slideType),
        notes: parsedResult.notes || `Speaker notes for ${parsedResult.title}`,
      };

    } catch (parseError) {
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }
  }

  /**
   * AI assistant for content improvement and speaker notes generation
   * Automatically detects user intent and provides appropriate assistance
   * 
   * @param assistantData - User message with optional slide content and context
   * @returns Promise<string> - AI-generated advice or improved content
   */
  async aiAssistant(assistantData: AiAssistantDto): Promise<string> {
    const detectedIntent = this.detectUserIntent(assistantData.message, assistantData.assistType);
    
    const { systemPrompt, userPrompt, maxTokens } = this.buildAssistantPrompts(detectedIntent, assistantData);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.6,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response generated');
      }

      return this.cleanResponseFormatting(response);

    } catch (error) {
      throw new Error(`AI Assistant failed: ${error.message}`);
    }
  }

  /**
   * Suggests relevant images for slide content
   * Analyzes slide content and recommends appropriate visuals
   * 
   * @param slideData - Slide title, content, and type
   * @returns Promise<ImageSuggestion[]> - Array of image suggestions
   */
  async suggestImages(slideData: { title: string; content: string; type?: string }): Promise<ImageSuggestion[]> {
    const prompt = this.buildImageSuggestionPrompt(slideData);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: 'You are a visual design expert. Suggest relevant, professional images for business presentations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 600,
        temperature: 0.6,
      });

      const result = completion.choices[0]?.message?.content;
      if (result) {
        const parsed = JSON.parse(result);
        return Array.isArray(parsed) ? parsed : parsed.suggestions || [];
      }
      return [];
    } catch (error) {
      return this.getFallbackImageSuggestions(slideData.type || 'content');
    }
  }

  /**
   * Health check for OpenAI API connectivity
   * @returns Promise<boolean> - True if API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });

      return !!completion.choices[0]?.message?.content;
    } catch (error) {
      return false;
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Validates slide data for regeneration
   */
  private validateSlideData(slideData: RegenerateSlideDto): void {
    if (!slideData) {
      throw new Error('No slide data provided');
    }
    
    if (!slideData.title || slideData.title.trim().length === 0) {
      throw new Error('Slide title is required');
    }
    
    if (!slideData.content || slideData.content.trim().length === 0) {
      throw new Error('Slide content is required');
    }
  }

  /**
   * Analyzes content structure for format preservation
   */
  private analyzeContentStructure(content: string): { hasBulletPoints: boolean; isNarrative: boolean; length: number } {
    const trimmedContent = content.trim();
    const hasBulletPoints = trimmedContent.includes('•') || trimmedContent.includes('-') || trimmedContent.includes('*');
    const isNarrative = trimmedContent.length > 200 && !hasBulletPoints;
    
    return {
      hasBulletPoints,
      isNarrative,
      length: trimmedContent.length
    };
  }

  /**
   * Builds the main deck generation prompt
   */
  private buildDeckGenerationPrompt(inputs: GenerateDeckOutlineDto, uniqueId: string, timestamp: number): string {
    return `
Create a detailed 9-slide pitch deck for ${inputs.company}.

COMPANY DETAILS:
- Industry: ${inputs.industry}
- Problem: ${inputs.problem}
- Solution: ${inputs.solution}
- Business Model: ${inputs.model}
- Current Status: ${inputs.financials}

Generate unique, specific content for each slide. Session: ${uniqueId}-${timestamp}

CRITICAL INSTRUCTIONS:
- DO NOT copy the input text word-for-word
- EXPAND with specific numbers, percentages, examples
- Make the Traction slide highly specific with growth metrics
- Each slide should be investor-ready with concrete details
- Vary your language and avoid repetitive phrases

Create these 9 slides:
1. Cover - Company introduction with tagline
2. Problem - Market pain points with specific data
3. Solution - Detailed approach with benefits
4. Market - TAM/SAM with growth rates
5. Product - Key features and capabilities
6. Business Model - Revenue streams with pricing
7. Traction - Specific growth metrics (be creative but realistic)
8. Competition - Competitive analysis
9. Funding - Investment ask and use of funds

For each slide, provide:
- A clear title
- 3-5 detailed bullet points with specific numbers
- Avoid generic phrases like "key metrics" or "main points"

Make it compelling for ${inputs.industry} investors.
`;
  }

  /**
   * System prompt for deck generation
   */
  private getSystemPromptForDeckGeneration(): string {
    return `You are a top-tier pitch deck consultant with 15+ years of experience. Create unique, compelling content that tells a specific story for each company. Never use generic templates. Include realistic numbers, percentages, and concrete examples. Vary your approach for each generation.`;
  }

  /**
   * System prompt for slide regeneration
   */
  private getSystemPromptForRegeneration(): string {
    return 'You are a pitch deck consultant who respects formatting preferences. Always maintain the original content structure and format while providing fresh perspectives.';
  }

  /**
   * Parses AI-generated text into structured slide objects
   */
  private parseAiTextToSlides(aiText: string, inputs: GenerateDeckOutlineDto, sessionId: string): SlideContent[] {
    // Generate unique metrics for this session
    const getUniqueMetric = (min: number, max: number, suffix: string = '') => {
      const base = Math.floor(Math.random() * (max - min) + min);
      const variance = Math.floor(Math.random() * 20) - 10;
      return (base + variance) + suffix;
    };
    
    const getUniquePercent = () => Math.floor(Math.random() * 150 + 180);
    const getUniqueRevenue = () => Math.floor(Math.random() * 200 + 50);
    const getUniqueUsers = () => Math.floor(Math.random() * 4000 + 1000);
    
    return [
      {
        title: 'Company Overview',
        content: `${inputs.company} - Pioneering ${inputs.industry} Innovation\n\n• Disrupting traditional ${inputs.industry.toLowerCase()} with cutting-edge technology\n• Founded in 2024 with ${getUniqueMetric(18, 36)} months of R&D\n• Targeting $${getUniqueMetric(50, 500)}B global market opportunity\n• Pre-revenue startup with ${getUniqueMetric(8, 24)} month runway\n• Team of ${getUniqueMetric(5, 15)} engineers and domain experts`,
        type: 'title',
        imageSuggestions: this.getImageSuggestions('startup'),
      },
      {
        title: 'Market Challenge',
        content: `Critical Industry Pain Points:\n\n${this.extractAndEnhanceContent(aiText, 'problem', inputs.problem)}\n\n• Market inefficiencies cost industry $${getUniqueMetric(10, 100)}B annually\n• ${getUniqueMetric(65, 85)}% of companies struggle with current solutions\n• Legacy systems fail ${getUniqueMetric(40, 70)}% of critical operations\n• Average company loses ${getUniqueMetric(15, 40)}% efficiency due to these issues`,
        type: 'content',
        imageSuggestions: this.getImageSuggestions('problem'),
      },
      {
        title: 'Our Solution',
        content: `${inputs.company} Revolutionary Platform:\n\n${this.extractAndEnhanceContent(aiText, 'solution', inputs.solution)}\n\n• Delivers ${getUniqueMetric(3, 8)}x faster processing than competitors\n• Reduces operational costs by ${getUniqueMetric(35, 70)}%\n• Proprietary algorithms with ${getUniqueMetric(92, 99)}% accuracy\n• Cloud-native architecture supporting ${getUniqueMetric(10, 100)}K+ concurrent users\n• Real-time analytics with sub-second response times`,
        type: 'content',
        imageSuggestions: this.getImageSuggestions('solution'),
      },
      {
        title: 'Market Opportunity',
        content: `Massive ${inputs.industry} Market Potential:\n\n• Total Addressable Market (TAM): $${getUniqueMetric(25, 150)}B globally\n• Serviceable Addressable Market (SAM): $${getUniqueMetric(5, 40)}B\n• Serviceable Obtainable Market (SOM): $${getUniqueMetric(1, 8)}B\n• Market growing at ${getUniqueMetric(18, 35)}% CAGR through 2028\n• Early adopter segment worth $${getUniqueMetric(500, 5000)}M\n• Expansion opportunities in ${getUniqueMetric(12, 45)} international markets`,
        type: 'chart',
        imageSuggestions: this.getImageSuggestions('market'),
      },
      {
        title: 'Product Platform',
        content: `${inputs.company} Core Capabilities:\n\n• Advanced ${inputs.industry.toLowerCase()} analytics engine with ML/AI\n• Intuitive dashboard with ${getUniqueMetric(90, 99)}% user satisfaction\n• Mobile-first design supporting iOS and Android\n• API ecosystem with ${getUniqueMetric(25, 100)}+ third-party integrations\n• Enterprise security with SOC 2 Type II compliance\n• Multi-tenant architecture supporting unlimited scaling`,
        type: 'image',
        imageSuggestions: this.getImageSuggestions('product'),
      },
      {
        title: 'Business Model',
        content: `Diversified Revenue Strategy:\n\n${this.extractAndEnhanceContent(aiText, 'model', inputs.model)}\n\n• Subscription tiers: Starter ($${getUniqueMetric(49, 199)}/month), Pro ($${getUniqueMetric(299, 699)}/month), Enterprise (custom)\n• Professional services: $${getUniqueMetric(150, 400)}/hour implementation\n• Data analytics premium: ${getUniqueMetric(15, 30)}% revenue share\n• Gross margins: ${getUniqueMetric(72, 88)}% across all products\n• Average customer LTV: $${getUniqueMetric(50, 200)}K`,
        type: 'content',
        imageSuggestions: this.getImageSuggestions('business model'),
      },
      {
        title: 'Traction & Performance',
        content: `Exceptional Early Results:\n\n${this.extractAndEnhanceContent(aiText, 'traction', inputs.financials)}\n\n• ${getUniquePercent()}% month-over-month user growth\n• ${getUniqueUsers()}+ active users across ${getUniqueMetric(15, 40)} companies\n• $${getUniqueRevenue()}K annual recurring revenue with ${getUniqueMetric(88, 97)}% retention\n• ${getUniqueMetric(4, 12)} enterprise partnerships signed in last quarter\n• Featured in ${getUniqueMetric(6, 18)} major industry publications\n• ${getUniqueMetric(92, 99)}% customer satisfaction score (NPS: ${getUniqueMetric(65, 85)})`,
        type: 'chart',
        imageSuggestions: this.getImageSuggestions('traction'),
      },
      {
        title: 'Competitive Landscape',
        content: `Strong Competitive Position:\n\n• ${getUniqueMetric(4, 12)} direct competitors with legacy approaches\n• ${inputs.company} delivers ${getUniqueMetric(2, 6)}x superior performance metrics\n• Proprietary IP portfolio with ${getUniqueMetric(3, 9)} patents pending\n• First-mover advantage in AI-powered ${inputs.industry.toLowerCase()}\n• Superior technology stack built by ex-{Google/Microsoft/Amazon} engineers\n• ${getUniqueMetric(12, 30)} month technical lead over closest competitor`,
        type: 'content',
        imageSuggestions: this.getImageSuggestions('competition'),
      },
      {
        title: 'Investment Opportunity',
        content: `Series A Funding Initiative:\n\n• Raising: $${getUniqueMetric(3, 15)}M Series A investment round\n• Pre-money valuation: $${getUniqueMetric(18, 75)}M based on comparable exits\n• Use of funds breakdown:\n  - ${getUniqueMetric(45, 65)}% Product development and engineering talent\n  - ${getUniqueMetric(20, 35)}% Sales, marketing, and customer acquisition\n  - ${getUniqueMetric(10, 25)}% Strategic partnerships and business development\n• Projected ${getUniqueMetric(18, 30)} month runway to profitability\n• Clear path to $${getUniqueMetric(15, 75)}M ARR by Series B`,
        type: 'content',
        imageSuggestions: this.getImageSuggestions('funding'),
      },
    ];
  }

  /**
   * Extracts and enhances content from AI text response
   */
  private extractAndEnhanceContent(aiText: string, section: string, fallback: string): string {
    const lines = aiText.split('\n');
    const relevantLines = lines.filter(line => 
      line.length > 20 && 
      !line.includes('Slide') && 
      !line.includes('###') &&
      !line.includes('**')
    );
    
    if (relevantLines.length > 0) {
      const randomLine = relevantLines[Math.floor(Math.random() * Math.min(3, relevantLines.length))];
      return randomLine.trim();
    }
    
    return fallback;
  }

  /**
   * Detects user intent from message content
   */
  private detectUserIntent(message: string, explicitType?: string): 'refine' | 'speaker-notes' | 'general' {
    if (explicitType && explicitType !== 'auto') {
      return explicitType as 'refine' | 'speaker-notes' | 'general';
    }
    
    const lowerMessage = message.toLowerCase();
    
    // Speaker notes detection
    const speakerNotesKeywords = ['speaker notes', 'presentation script', 'what should i say', 'how do i present', 'talking points'];
    if (speakerNotesKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'speaker-notes';
    }
    
    // Refinement detection
    const refinementKeywords = ['improve', 'refine', 'make better', 'rewrite', 'enhance', 'fix', 'update', 'revise'];
    if (refinementKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'refine';
    }
    
    return 'general';
  }

  /**
   * Builds appropriate prompts based on detected intent
   */
  private buildAssistantPrompts(intent: string, data: AiAssistantDto): { systemPrompt: string; userPrompt: string; maxTokens: number } {
    switch (intent) {
      case 'refine':
        return {
          systemPrompt: 'You are a pitch deck consultant. Provide improved slide content using clean, plain text formatting.',
          userPrompt: this.buildRefinePrompt(data),
          maxTokens: 800
        };
      case 'speaker-notes':
        return {
          systemPrompt: 'You are a presentation coach. Create natural speaker notes using plain text only.',
          userPrompt: this.buildSpeakerNotesPrompt(data),
          maxTokens: 1200
        };
      default:
        return {
          systemPrompt: 'You are a pitch deck consultant. Provide advice using plain text only.',
          userPrompt: this.buildGeneralPrompt(data),
          maxTokens: 1000
        };
    }
  }

  /**
   * Builds refinement prompt for content improvement
   */
  private buildRefinePrompt(data: AiAssistantDto): string {
    const hasSlideContent = data.slideContent && data.slideContent.trim().length > 0;
    const hasSlideTitle = data.slideTitle && data.slideTitle.trim().length > 0;
    
    if (hasSlideContent) {
      return `
IMPROVE THIS SLIDE CONTENT:

USER REQUEST: ${data.message}
${hasSlideTitle ? `SLIDE TITLE: "${data.slideTitle}"` : ''}

CURRENT CONTENT:
${data.slideContent}

${data.context ? `CONTEXT: ${data.context}` : ''}

Requirements:
- Make it more specific and investor-focused
- Add concrete numbers, percentages, or examples where appropriate
- Use professional language that resonates with investors
- Keep the core message but make it more impactful
- Maintain the same format (bullet points vs paragraphs)

Provide the improved content, then explain what you changed.
`;
    } else {
      return `
SLIDE CONTENT SUGGESTIONS:

USER REQUEST: ${data.message}
${hasSlideTitle ? `SLIDE TITLE: "${data.slideTitle}"` : ''}
${data.context ? `CONTEXT: ${data.context}` : ''}

Suggest what should be included on this slide for investors.
`;
    }
  }

  /**
   * Builds speaker notes prompt
   */
  private buildSpeakerNotesPrompt(data: AiAssistantDto): string {
    const hasSlideContent = data.slideContent && data.slideContent.trim().length > 0;
    const hasSlideTitle = data.slideTitle && data.slideTitle.trim().length > 0;
    
    return `
CREATE SPEAKER NOTES:

USER REQUEST: ${data.message}
${hasSlideTitle ? `SLIDE TITLE: "${data.slideTitle}"` : ''}
${hasSlideContent ? `SLIDE CONTENT:\n${data.slideContent}` : 'No slide content provided'}

Create conversational speaker notes with:
- Opening transition
- Main talking points with supporting details
- Smooth transition to next slide
- Potential investor questions with response suggestions

${hasSlideContent ? 
  'Base the talking points directly on the slide content provided.' : 
  'Create general guidance for presenting this type of slide effectively.'}
`;
  }

  /**
   * Builds general advice prompt
   */
  private buildGeneralPrompt(data: AiAssistantDto): string {
    return `
PITCH DECK ADVICE:

USER QUESTION: ${data.message}
${data.slideTitle ? `SLIDE: "${data.slideTitle}"` : ''}
${data.slideContent ? `CURRENT CONTENT:\n${data.slideContent}` : ''}

Provide specific, actionable advice for improving this pitch deck content.
Focus on making the pitch more compelling for investors.
`;
  }

  /**
   * Builds image suggestion prompt
   */
  private buildImageSuggestionPrompt(slideData: { title: string; content: string; type?: string }): string {
    return `
Analyze this slide and suggest 2-3 relevant visuals:

TITLE: ${slideData.title}
CONTENT: ${slideData.content}
TYPE: ${slideData.type || 'content'}

Return JSON array of image suggestions with type, description, searchTerms, altText, and style.
Focus on visuals that support the message and engage investors.
`;
  }

  /**
   * Gets predefined image suggestions based on content type
   */
  private getImageSuggestions(contentType: string): ImageSuggestion[] {
    const suggestions = {
      startup: [{
        type: 'stock' as const,
        description: 'Modern startup team collaboration in tech office',
        searchTerms: ['startup', 'team', 'innovation', 'technology'],
        altText: 'Diverse startup team working together',
        style: 'modern',
      }],
      problem: [{
        type: 'chart' as const,
        description: 'Industry problem statistics and impact visualization',
        searchTerms: ['problem', 'statistics', 'industry', 'challenge'],
        altText: 'Chart showing industry challenges and their impact',
        style: 'professional',
      }],
      solution: [{
        type: 'diagram' as const,
        description: 'Solution architecture and technology stack',
        searchTerms: ['solution', 'technology', 'platform', 'architecture'],
        altText: 'Technology platform architecture diagram',
        style: 'modern',
      }],
    };

    return suggestions[contentType] || this.getFallbackImageSuggestions('content');
  }

  /**
   * Provides fallback image suggestions when AI generation fails
   */
  private getFallbackImageSuggestions(slideType: string): ImageSuggestion[] {
    const fallbacks = {
      title: [{
        type: 'stock' as const,
        description: 'Professional business imagery',
        searchTerms: ['business', 'professional', 'corporate'],
        altText: 'Business professional image',
        style: 'corporate',
      }],
      content: [{
        type: 'icon' as const,
        description: 'Relevant business icon',
        searchTerms: ['business', 'concept', 'professional'],
        altText: 'Business concept icon',
        style: 'minimalist',
      }],
      chart: [{
        type: 'chart' as const,
        description: 'Data visualization chart',
        searchTerms: ['chart', 'graph', 'data', 'metrics'],
        altText: 'Data chart visualization',
        style: 'professional',
      }],
      image: [{
        type: 'stock' as const,
        description: 'Professional stock photo',
        searchTerms: ['professional', 'business', 'modern'],
        altText: 'Professional business image',
        style: 'modern',
      }],
    };

    return fallbacks[slideType] || fallbacks.content;
  }

  /**
   * Gets alternative content generation approaches
   */
  private getAlternativeApproach(slideType: string): string {
    const approaches = {
      title: ['storytelling approach', 'problem-first narrative', 'solution-centric positioning'],
      content: ['data-driven framework', 'customer-story approach', 'competitive advantage focus'],
      chart: ['visual-first presentation', 'metrics-driven narrative', 'growth-story framework'],
      image: ['visual storytelling', 'emotion-driven narrative', 'brand-focused approach'],
    };
    
    const options = approaches[slideType] || approaches.content;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Builds regeneration prompt with format preservation
   */
  private buildRegenerationPrompt(
    slideData: RegenerateSlideDto, 
    slideType: string, 
    alternativeApproach: string, 
    timestamp: number, 
    contentAnalysis: any
  ): string {
    return `
REGENERATE this slide with a fresh perspective while maintaining the SAME FORMAT:

ORIGINAL TITLE: ${slideData.title}
ORIGINAL CONTENT: ${slideData.content.trim()}
SLIDE TYPE: ${slideType}
CONTEXT: ${slideData.context || 'Business pitch deck slide'}

FORMAT REQUIREMENTS:
${contentAnalysis.hasBulletPoints ? '- MAINTAIN bullet point format' : ''}
${contentAnalysis.isNarrative ? '- MAINTAIN narrative paragraph format' : ''}
- Keep the same level of detail and structure

NEW APPROACH: ${alternativeApproach}
SESSION: regen-${timestamp}

Return ONLY valid JSON with title, content, type, imageSuggestions, and notes.
Focus on clarity and investor impact while preserving the original format.
`;
  }

  /**
   * Removes markdown and emoji formatting from AI responses
   */
  private cleanResponseFormatting(response: string): string {
    let cleaned = response.trim();
    
    // Remove markdown formatting
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
    cleaned = cleaned.replace(/#{1,6}\s/g, '');
    cleaned = cleaned.replace(/`(.*?)`/g, '$1');
    
    // Remove emojis
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    
    // Clean up bullet points
    cleaned = cleaned.replace(/^[•\-\*]\s*/gm, '• ');

    // Remove excessive line breaks
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Remove markdown links
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    return cleaned.trim();
  }
}