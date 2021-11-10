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
    //wesbos.com/template-strings-html
    const markup = `
<div class="beer">
    <h2>${survey.pro}</h2>
    <p class="brewery">${beer.brewery}
</div>
`;
    // const appNode = document.getElementById("app") as HTMLElement;
    // const templateQuestion = document.getElementById(
    //   "question"
    // ) as HTMLTemplateElement;
    // const templateQuestionContent = templateQuestion?.content;

    // const templateAnswer = document.getElementById(
    //   "answer"
    // ) as HTMLTemplateElement;
    // const templatAnswerContent = templateAnswer?.content;

    // console.log(templateQuestionContent);
    // console.log(templatAnswerContent);

    // survey.forEach((question) => {
    //   appNode.appendChild(templateQuestionContent);
    //   console.group(question.prompt);
    //   question.answers.forEach((answers) => {
    //     const li = document.createElement("li");
    //     appNode.appendChild(templatAnswerContent);
    //     console.log(answers);
    //   });
    // });
  };

  init = async () => {
    const response = await this.rs.getSurvey();
    if (response !== undefined) {
      this.survey = await response.data;
      this.buildDOM(this.survey);
    }
  };
}
