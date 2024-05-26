import { Injectable } from '@angular/core';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private API = 'AIzaSyDgkRJG5oln3xvNDuEDS9KqsMLuxyieLTk'

  createModel(): GenerativeModel {
    const generativeAPI = new GoogleGenerativeAI(this.API);
    // indica el nombre del modelo ia: gemini-pro-vision
    return generativeAPI.getGenerativeModel({ model: 'gemini-pro-vision' });  // indicamos el modelo que correremos
  }
}
