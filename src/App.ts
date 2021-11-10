import { ApiRequestService } from "./request-service";

export interface SurveyResponse {
  success: boolean;
  data: Survey[];
}

export interface Survey {
  prompt: string;
  answers: [string?];
  id: number;
}

export class App {
  constructor() {}
  private rs = new ApiRequestService();
  private survey: Survey[] | undefined = [];

  buildDOM = (survey: Survey[]) => {
    console.dir(survey);
    survey.forEach((question) => {
      console.group(question.prompt);
      question.answers.forEach((answers) => {
        console.log(answers);
      });
    });
  };

  init = async () => {
    const response = await this.rs.getSurvey();
    if (response !== undefined) {
      this.survey = await response.data;
      this.buildDOM(this.survey);
    }
  };
}
