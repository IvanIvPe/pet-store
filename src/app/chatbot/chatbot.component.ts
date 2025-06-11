import { Component, ViewChild, ElementRef, OnInit, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service'; // <- proveri putanju!

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  userMessage: string = '';
  messages: { sender: string, text: string, image?: string | null }[] = [];
  isOpen: boolean = false;
  userEmail: string = '';
  loggedIn: boolean = false;

  @ViewChild('chatBody', { static: false }) chatBody!: ElementRef;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
    } else {
      this.messages.push({ sender: 'bot', text: 'Hello! Welcome to our Pet Store 🐾. How can I help you today?' });
      this.saveMessages();
    }

    const user = this.authService.getCurrentUser();
    if (user && user.email) {
      this.userEmail = user.email;
      this.loggedIn = true;
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    const messageToSend = this.userMessage.trim();
    this.messages.push({ sender: 'user', text: messageToSend });
    this.saveMessages();
    this.userMessage = '';

    this.messages.push({ sender: 'bot', text: 'Thinking...' });
    this.saveMessages();

    this.http.post<any>('http://localhost:5005/webhooks/rest/webhook', {
      sender: 'user',
      message: messageToSend,
      metadata: {
        logged_in: this.loggedIn,
        user_email: this.userEmail
      }
    }).subscribe(res => {
      this.messages.pop();
      for (let r of res) {
        this.messages.push({
          sender: 'bot',
          text: r.text,
          image: r.image || null
        });
      }
      this.saveMessages();
    }, err => {
      this.messages.pop();
      this.messages.push({ sender: 'bot', text: 'Error communicating with the server.' });
      this.saveMessages();
    });
  }

  saveMessages() {
    localStorage.setItem('chat_messages', JSON.stringify(this.messages));
  }

  clearChat() {
    this.messages = [
      { sender: 'bot', text: 'Hello! Welcome to our Pet Store 🐾. How can I help you today?' }
    ];
    this.saveMessages();
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.chatBody) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }
  }
}
