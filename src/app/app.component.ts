import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GenerativeModel } from '@google/generative-ai';
import { GeminiService } from './service/gemini/gemini.service';
import { RECIPE } from './prompts/food.promt';
import { LoadingComponent } from './loading/loading.component';

interface Recipe {
  name: string;
  country: string;
  ingredients: string[];
  recipe: string;
  details: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  geminiService = inject(GeminiService);

  title = 'angular-gemini';
  model: GenerativeModel;

  recipe = signal<Recipe | null>(null);
  imgPreview = signal('');
  isLoading = false;


  constructor() {
    this.model = this.geminiService.createModel();
  }

  async getFile(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files?.length === 0) return;

    this.isLoading = true;
    const file = (target.files as FileList)[0];

    const data = await this.fileToGenerativePart(file);

    this.generationRecipe(data)
      .finally(() => this.isLoading = false);
  }

  /**
   * 
   * @param file archivo de imagen
   * @returns objeto con la base64 del archivo y su tipo
   */
  async fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });

    const img = await base64EncodedDataPromise;
    this.imgPreview.set(`data:image/png;base64, ${img}`);

    return {
      inlineData: {
        data: img,
        mimeType: file.type
      }
    }
  }

  async generationRecipe(data: any) {
    try {
      /**
       * generateContent([prompt_que_usaremos, imagen])
       */
      const result = await this.model.generateContent([RECIPE, data]);
      const response = result.response;

      console.log(response.text());
      this.recipe.set(this.parseResponse(response.text()));
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 
   * @param response string que representa toda la respuesta de gemini (debemos retirar los ```)
   */
  parseResponse(response: string) {
    const res = response.replace(new RegExp('```', 'g'), '');
    return JSON.parse(res) as Recipe;
  }
}
