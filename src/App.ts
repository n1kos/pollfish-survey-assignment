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
  private appNode = document.getElementById("app") as HTMLElement;

  buildDOM = (survey: Survey[]) => {
    console.dir(survey);
    const questionNode = document.getElementById(
      "question"
    ) as HTMLTemplateElement;
    const questionContent = questionNode.content;

    const answerNode = document.getElementById("answer") as HTMLTemplateElement;
    const answerContent = answerNode.content;

    survey.forEach((question, index) => {
      console.log(question);
      // let elem = document.createElement('div');
      // elem.append(tmpl.content.cloneNode(true));

      this.appNode.appendChild(questionContent.cloneNode(true));
      question.answers.forEach((answer) => {
        const latestQuestion = this.appNode
          .querySelectorAll(".question")
          [index].querySelector(".answer");
        console.log(answer);
        console.log(latestQuestion);
        latestQuestion?.appendChild(answerContent.cloneNode(true));
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
