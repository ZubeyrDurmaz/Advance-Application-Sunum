import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { AiService, ConversationMessage, ProductRecommendation } from '../../core/services/ai.service';

interface Message {
  role: 'user' | 'ai';
  text: string;
  recommendations?: ProductRecommendation[];
  followUp?: string;
}

@Component({
  selector: 'app-chronos-ai',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Navbar],
  templateUrl: './chronos-ai.html',
  styleUrl: './chronos-ai.css',
})
export class ChronosAi {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  inputText = '';
  isTyping = false;

  suggestions = [
    'Show available watches',
    'Browse by category',
    'Find by price',
  ];

  messages: Message[] = [];

  constructor(
    private aiService: AiService,
    private cdr: ChangeDetectorRef,
  ) {}

  onSend(): void {
    const text = this.inputText.trim();
    if (!text || this.isTyping) return;

    this.messages = [...this.messages, { role: 'user', text }];
    this.inputText = '';
    this.isTyping = true;
    this.cdr.markForCheck();
    this.scrollAfterRender();

    const history = this.buildHistory();

    this.aiService.query(text, history).subscribe({
      next: (response) => {
        this.messages = [...this.messages, {
          role: 'ai',
          text: response.text,
          recommendations: response.recommendations ?? undefined,
          followUp: response.followUp ?? undefined,
        }];
        this.isTyping = false;
        this.cdr.markForCheck();
        this.scrollAfterRender();
      },
      error: () => {
        this.messages = [...this.messages, {
          role: 'ai',
          text: 'Our curatorial system is momentarily indisposed. Please allow a moment and try again.',
        }];
        this.isTyping = false;
        this.cdr.markForCheck();
        this.scrollAfterRender();
      },
    });
  }

  onSuggestion(suggestion: string): void {
    this.inputText = suggestion;
    this.onSend();
  }

  onDetails(watch: ProductRecommendation): void {
    this.inputText = `Tell me more about ${watch.name}`;
    this.onSend();
  }

  private buildHistory(): ConversationMessage[] {
    return this.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
      content: msg.text,
    }));
  }

  private scrollAfterRender(): void {
    setTimeout(() => {
      try {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      } catch {}
    }, 0);
  }
}
