import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';

interface WatchRecommendation {
  name: string;
  ref: string;
  price: string;
  image: string;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  recommendations?: WatchRecommendation[];
  followUp?: string;
}

const AI_RESPONSES: { keywords: string[]; text: string; followUp?: string; recommendations?: WatchRecommendation[] }[] = [
  {
    keywords: ['vintage', 'leather', 'under', '20000', 'clean', 'historical'],
    text: 'A discerning choice. In the realm of vintage aesthetics under $20,000, we move away from raw utility toward the pure elegance of mid-century design. For your profile, I have curated three exceptional timepieces that honor horological heritage.',
    followUp: 'The Patek Philippe 5119G features the iconic Clous de Paris guilloché bezel, a hallmark of mid-century sophistication. Should you wish to explore the mechanical intricacies, I can arrange a private viewing.',
    recommendations: [
      { name: 'Patek Philippe Calatrava', ref: 'Ref. 5119G-001', price: '$18,500', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIIZnOwQy_BacMPA5tSNI6xzPwHhMSG6_7VGhkk2gIAd2ju1CxrM-Z2gwmKBYtSSMoK3JQL0Pr6XFEF7Qz_DTSj_H-1Qdf_QRiJw-HpTL18KYhWMHKXFmLVy1JmrwnAwkQoBt4BZ6T7wggkmMZXERQ2eCBjozSOZRSlnAwDjMfjBep1EG4tpiDlY_7W7dg28Mae0_MQERHPc_V0cb5vlDdsBsoZNUowXz2IGk1wsfI1savvTEUmJU9XIkgqK38GXMRe5SSPsRpO1sP' },
      { name: 'Vacheron Constantin', ref: 'Patrimoine Hand-Wound', price: '$19,200', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4RTKGqth6J07vh-wfG_jGnOraBVYr_sWGIrfGX6kfrMWyWroD9oaK6O6AD3XZHBN62ngNf7Q04u9DH_4ffdLX045ayR4DPbw_5SV8ptqwO-Ci_ywNR1HB4gruYWaYpZYQV4aNdMsNKwwVtrPJ2C-4eai7wciP1KM4RO1bufkbDflhfQAl_Ac0z2hWFZSss4_zRgTEo0LlznNqxl7Wc7sSKhWPVa_NFJ6G1G9t62ytmpCtJStpAzEghAAJNZAU3vNI059VIvMfZhIk' },
      { name: 'Jaeger-LeCoultre', ref: 'Reverso Tribute Monoface', price: '$9,800', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSowoRLQZiHXIE3XhGe_hFvm9cfFmk69aPsFG3Dr6Tqhjq_qtuOBclDZM61WQ1VSchBC1FHjHuCC4svOpceqY86ZDtPqWs5j5FwNHpsYvEZUF-OSh5mCQGm9ekiP3hve3llSLP89SnkiE_EGN0EnXVNS8dHHOQUv-lagcsBPXfi5NOoqPKI7Y1Tg5cRt0AeTf2BseymDlH_LLNPWpqhG6IrAcZ6t4GKto7d0p5NrFZhiOHRWtgQhMVFkajfeph4GqWXuEGjHq4tjE-' },
    ],
  },
  {
    keywords: ['calatrava', 'history'],
    text: 'The Calatrava collection, introduced in 1932, takes its name from the cross of the Order of Calatrava — a symbol of purity and perfection. It embodies the Bauhaus principle that form follows function, with every element serving the singular purpose of elegant timekeeping.',
    followUp: 'The reference 5119 continues this tradition with a white gold case, hand-stitched alligator strap, and the celebrated Caliber 215 PS movement — a masterpiece of miniaturization.',
  },
  {
    keywords: ['movement', 'details', 'mechanical'],
    text: 'The Caliber 215 PS powering the Calatrava 5119G is a self-winding movement with a peripheral rotor, allowing the dial to remain unobstructed. It beats at 28,800 vph and offers a 44-hour power reserve — a testament to Patek Philippe\'s commitment to mechanical excellence.',
    followUp: 'Each movement is hand-finished with Côtes de Genève striping, beveled edges, and polished chamfers — details invisible to the casual observer but deeply meaningful to the connoisseur.',
  },
  {
    keywords: ['availability', 'available', 'stock'],
    text: 'All three pieces I have presented are currently available through our private acquisition channel. The Calatrava 5119G is particularly rare — only two examples remain in our vault. I would recommend expressing interest promptly.',
    followUp: 'Our concierge team can arrange a private viewing at your convenience, with full authentication documentation and provenance records provided for each timepiece.',
  },
];

@Component({
  selector: 'app-chronos-ai',
  imports: [FormsModule, Navbar],
  templateUrl: './chronos-ai.html',
  styleUrl: './chronos-ai.css',
})
export class ChronosAi implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  inputText = '';
  isTyping = false;

  suggestions = [
    'Tell me about Calatrava history',
    'Show movement details',
    'Check Availability',
  ];

  messages: Message[] = [
    {
      role: 'user',
      text: 'I am looking for a vintage-style watch with a leather strap under $20,000. I appreciate clean dials and historical significance.',
    },
    {
      role: 'ai',
      text: 'A discerning choice. In the realm of vintage aesthetics under $20,000, we move away from raw utility toward the pure elegance of mid-century design. For your profile, I have curated three exceptional timepieces that honor horological heritage.',
      followUp: 'The Patek Philippe 5119G features the iconic Clous de Paris guilloché bezel, a hallmark of mid-century sophistication. Should you wish to explore the mechanical intricacies, I can arrange a private viewing.',
      recommendations: [
        { name: 'Patek Philippe Calatrava', ref: 'Ref. 5119G-001', price: '$18,500', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIIZnOwQy_BacMPA5tSNI6xzPwHhMSG6_7VGhkk2gIAd2ju1CxrM-Z2gwmKBYtSSMoK3JQL0Pr6XFEF7Qz_DTSj_H-1Qdf_QRiJw-HpTL18KYhWMHKXFmLVy1JmrwnAwkQoBt4BZ6T7wggkmMZXERQ2eCBjozSOZRSlnAwDjMfjBep1EG4tpiDlY_7W7dg28Mae0_MQERHPc_V0cb5vlDdsBsoZNUowXz2IGk1wsfI1savvTEUmJU9XIkgqK38GXMRe5SSPsRpO1sP' },
        { name: 'Vacheron Constantin', ref: 'Patrimoine Hand-Wound', price: '$19,200', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4RTKGqth6J07vh-wfG_jGnOraBVYr_sWGIrfGX6kfrMWyWroD9oaK6O6AD3XZHBN62ngNf7Q04u9DH_4ffdLX045ayR4DPbw_5SV8ptqwO-Ci_ywNR1HB4gruYWaYpZYQV4aNdMsNKwwVtrPJ2C-4eai7wciP1KM4RO1bufkbDflhfQAl_Ac0z2hWFZSss4_zRgTEo0LlznNqxl7Wc7sSKhWPVa_NFJ6G1G9t62ytmpCtJStpAzEghAAJNZAU3vNI059VIvMfZhIk' },
        { name: 'Jaeger-LeCoultre', ref: 'Reverso Tribute Monoface', price: '$9,800', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSowoRLQZiHXIE3XhGe_hFvm9cfFmk69aPsFG3Dr6Tqhjq_qtuOBclDZM61WQ1VSchBC1FHjHuCC4svOpceqY86ZDtPqWs5j5FwNHpsYvEZUF-OSh5mCQGm9ekiP3hve3llSLP89SnkiE_EGN0EnXVNS8dHHOQUv-lagcsBPXfi5NOoqPKI7Y1Tg5cRt0AeTf2BseymDlH_LLNPWpqhG6IrAcZ6t4GKto7d0p5NrFZhiOHRWtgQhMVFkajfeph4GqWXuEGjHq4tjE-' },
      ],
    },
  ];

  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  onSend(): void {
    const text = this.inputText.trim();
    if (!text) return;

    this.messages.push({ role: 'user', text });
    this.inputText = '';
    this.isTyping = true;
    this.shouldScroll = true;

    setTimeout(() => {
      const response = this.getResponse(text);
      this.messages.push({ role: 'ai', ...response });
      this.isTyping = false;
      this.shouldScroll = true;
    }, 1200);
  }

  onSuggestion(suggestion: string): void {
    this.inputText = suggestion;
    this.onSend();
  }

  onDetails(watch: WatchRecommendation): void {
    this.inputText = `Tell me more about the ${watch.name}`;
    this.onSend();
  }

  private getResponse(text: string): Omit<Message, 'role'> {
    const lower = text.toLowerCase();
    for (const r of AI_RESPONSES) {
      if (r.keywords.some(k => lower.includes(k))) {
        return { text: r.text, followUp: r.followUp, recommendations: r.recommendations };
      }
    }
    return {
      text: 'A fascinating inquiry. Our curatorial team specializes in exactly this kind of discernment. Allow me to consult our vault and present you with the most fitting selections from our current inventory.',
      followUp: 'Could you share more about your preferences — perhaps a particular era, complication, or material that speaks to you?',
    };
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch {}
  }
}
